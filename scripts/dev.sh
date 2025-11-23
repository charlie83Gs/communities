#!/bin/bash

# Development Helper Script
# Common Docker Compose operations for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: docker-compose.yml not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Function to show usage
show_usage() {
    echo -e "${BLUE}Development Helper Script${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start           Start all services"
    echo "  stop            Stop all services"
    echo "  restart         Restart all services"
    echo "  restart-api     Restart only the API service"
    echo "  restart-frontend Restart only the frontend service"
    echo "  logs            Show logs from all services"
    echo "  logs-api        Show logs from API service"
    echo "  logs-frontend   Show logs from frontend service"
    echo "  status          Show status of all services"
    echo "  shell-api       Open shell in API container"
    echo "  shell-frontend  Open shell in frontend container"
    echo "  clean           Clean node_modules volumes (fixes module issues)"
    echo "  clean-all       Clean all volumes (WARNING: destroys data)"
    echo "  rebuild         Rebuild and restart all services"
    echo "  rebuild-api     Rebuild and restart API service"
    echo "  rebuild-frontend Rebuild and restart frontend service"
    echo ""
    echo "Examples:"
    echo "  $0 start        # Start all services"
    echo "  $0 logs-api     # Follow API logs"
    echo "  $0 clean        # Clean node_modules volumes"
}

# Parse command
case "${1:-help}" in
    start)
        echo -e "${YELLOW}🚀 Starting services...${NC}"
        docker compose up -d
        echo -e "${GREEN}✅ Services started${NC}"
        docker compose ps
        ;;

    stop)
        echo -e "${YELLOW}🛑 Stopping services...${NC}"
        docker compose down
        echo -e "${GREEN}✅ Services stopped${NC}"
        ;;

    restart)
        echo -e "${YELLOW}🔄 Restarting all services...${NC}"
        docker compose restart
        echo -e "${GREEN}✅ Services restarted${NC}"
        docker compose ps
        ;;

    restart-api)
        echo -e "${YELLOW}🔄 Restarting API service...${NC}"
        docker compose restart api
        echo -e "${GREEN}✅ API service restarted${NC}"
        ;;

    restart-frontend)
        echo -e "${YELLOW}🔄 Restarting frontend service...${NC}"
        docker compose restart frontend
        echo -e "${GREEN}✅ Frontend service restarted${NC}"
        ;;

    logs)
        echo -e "${YELLOW}📋 Showing logs (Ctrl+C to exit)...${NC}"
        docker compose logs -f
        ;;

    logs-api)
        echo -e "${YELLOW}📋 Showing API logs (Ctrl+C to exit)...${NC}"
        docker compose logs -f api
        ;;

    logs-frontend)
        echo -e "${YELLOW}📋 Showing frontend logs (Ctrl+C to exit)...${NC}"
        docker compose logs -f frontend
        ;;

    status)
        echo -e "${YELLOW}📊 Service status:${NC}"
        docker compose ps
        ;;

    shell-api)
        echo -e "${YELLOW}🐚 Opening shell in API container...${NC}"
        docker compose exec api /bin/sh
        ;;

    shell-frontend)
        echo -e "${YELLOW}🐚 Opening shell in frontend container...${NC}"
        docker compose exec frontend /bin/sh
        ;;

    clean)
        echo -e "${YELLOW}🧹 Cleaning node_modules volumes...${NC}"
        ./scripts/docker-clean.sh -v -r
        ;;

    clean-all)
        echo -e "${RED}⚠️  WARNING: This will delete ALL volumes including databases!${NC}"
        ./scripts/docker-clean.sh -a -r
        ;;

    rebuild)
        echo -e "${YELLOW}🔨 Rebuilding all services...${NC}"
        docker compose up -d --build
        echo -e "${GREEN}✅ Services rebuilt${NC}"
        docker compose ps
        ;;

    rebuild-api)
        echo -e "${YELLOW}🔨 Rebuilding API service...${NC}"
        docker compose up -d --build api
        echo -e "${GREEN}✅ API service rebuilt${NC}"
        ;;

    rebuild-frontend)
        echo -e "${YELLOW}🔨 Rebuilding frontend service...${NC}"
        docker compose up -d --build frontend
        echo -e "${GREEN}✅ Frontend service rebuilt${NC}"
        ;;

    help|--help|-h)
        show_usage
        ;;

    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac
