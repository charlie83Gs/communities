#!/bin/bash

# Docker Clean Script for Local Development
# This script helps resolve issues with stale node_modules in Docker volumes
# Common symptoms: "Cannot find module" errors after package updates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧹 Docker Development Environment Cleanup${NC}"
echo ""

# Function to confirm action
confirm() {
    read -p "$(echo -e ${YELLOW}$1 [y/N]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Aborted.${NC}"
        exit 1
    fi
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: docker-compose.yml not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Parse arguments
CLEAN_VOLUMES=false
CLEAN_ALL=false
REBUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--volumes)
            CLEAN_VOLUMES=true
            shift
            ;;
        -a|--all)
            CLEAN_ALL=true
            shift
            ;;
        -r|--rebuild)
            REBUILD=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -v, --volumes    Clean only node_modules volumes (fast, fixes most issues)"
            echo "  -a, --all        Clean all volumes including databases (WARNING: destroys data)"
            echo "  -r, --rebuild    Rebuild containers after cleaning"
            echo "  -h, --help       Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 -v           # Clean node_modules volumes only"
            echo "  $0 -v -r        # Clean node_modules and rebuild containers"
            echo "  $0 -a           # Clean everything (use with caution!)"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Default to volumes only if no option specified
if [ "$CLEAN_VOLUMES" = false ] && [ "$CLEAN_ALL" = false ]; then
    CLEAN_VOLUMES=true
fi

# Warn about data loss for --all
if [ "$CLEAN_ALL" = true ]; then
    echo -e "${RED}⚠️  WARNING: This will delete ALL volumes including databases!${NC}"
    echo -e "${RED}⚠️  You will lose all local data (users, communities, etc.)${NC}"
    confirm "Are you sure you want to continue?"
fi

# Stop containers
echo -e "${YELLOW}📦 Stopping Docker containers...${NC}"
docker compose down

if [ "$CLEAN_ALL" = true ]; then
    # Clean all volumes
    echo -e "${YELLOW}🗑️  Removing ALL volumes (including databases)...${NC}"
    docker compose down -v
    echo -e "${GREEN}✅ All volumes removed${NC}"
else
    # Clean only node_modules volumes
    echo -e "${YELLOW}🗑️  Removing node_modules volumes...${NC}"
    docker volume rm share-8_api_node_modules share-8_frontend_node_modules 2>/dev/null || true
    echo -e "${GREEN}✅ Node modules volumes removed${NC}"
fi

# Rebuild if requested
if [ "$REBUILD" = true ]; then
    echo -e "${YELLOW}🔨 Rebuilding containers...${NC}"
    docker compose up -d --build
    echo ""
    echo -e "${GREEN}✅ Containers rebuilt and started${NC}"
    echo -e "${YELLOW}📊 Container status:${NC}"
    docker compose ps
else
    echo ""
    echo -e "${GREEN}✅ Cleanup complete!${NC}"
    echo -e "${YELLOW}To start the services, run:${NC} docker compose up -d"
fi

echo ""
echo -e "${GREEN}Done! 🎉${NC}"
