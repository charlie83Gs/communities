FROM python:3.11-slim

WORKDIR /docs

# Install MkDocs and Material theme
RUN pip install --no-cache-dir \
    mkdocs==1.5.3 \
    mkdocs-material==9.5.3 \
    pymdown-extensions==10.7

# Copy documentation files
COPY mkdocs.yml /docs/
COPY docs/ /docs/docs/

# Expose MkDocs dev server port
EXPOSE 8000

# Run MkDocs dev server
CMD ["mkdocs", "serve", "--dev-addr=0.0.0.0:8000"]
