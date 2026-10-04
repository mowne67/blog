---
title: "The tools I've worked with building Health Eligible"
date: "2026-10-04T09:00:00+05:30"
tags: ["engineering", "ai", "tools"]
---

Building Health Eligible has taken me across much more than model APIs: backend development, document processing, voice, evaluation, analytics, and cloud infrastructure. This is an inventory of the tools I've worked with along the way, based on the backend repository and its development history as of 4 October 2026.

I've grouped them by the work they do. The application, development scripts, evaluation suites, and experiments have different stacks, so appearing here doesn't mean a tool is running in production today. This list covers directly used tools and explicit integrations, rather than every dependency pulled in by another package.

## The backend foundation

- **Python 3.12** — the language and runtime for the backend, rule processing, and supporting scripts.
- **FastAPI** — API endpoints, request handling, and dependency injection.
- **Starlette** — middleware and response primitives beneath the API.
- **Uvicorn** — the ASGI server used to run the application.
- **Pydantic** — typed request models, structured outputs, and validation.
- **HTTPX and Requests** — HTTP clients for service integrations, scraping, evaluation, and scripts.
- **asyncio** — Python's concurrency tools for asynchronous work and streaming paths.
- **DiskCache** — a persistent key-value store for conversation sessions. It is backed by SQLite.
- **glom** — reading and updating nested data structures.
- **python-dotenv** — loading environment configuration during development and in scripts.

## Models and conversation orchestration

- **OpenAI and its Python SDK** — model calls and structured extraction, alongside a separate realtime voice integration.
- **Anthropic / Claude** — an alternative chat-model integration through LangChain's Anthropic adapter.
- **OpenRouter** — a routing option for model calls through an OpenAI-compatible interface.
- **LangChain** — chat-model adapters, messages, tools, and agent construction.
- **LangGraph** — the graph that routes conversation work between components.

The repository also records **Amazon Bedrock** integration work in its history. I count that experience here, without treating the presence of provider settings as proof that a particular provider is currently serving production traffic.

## Retrieval and document processing

The regulation-query implementation uses a **PageIndex-style heading tree** to navigate documents. That is an implementation within the repository; there are also separate scripts using the **PageIndex cloud SDK** to check document upload and retrieval.

Around that retrieval work, I've used:

- **Beautiful Soup** — parsing scraped HTML.
- **markdownify** — converting HTML into Markdown for the document pipeline.
- **PyMuPDF** — reading PDF content.
- **python-docx** — reading Word documents for rule extraction.
- **PyYAML** — loading YAML definitions used in rule and interview processing.
- **JSON and Markdown** — formats for structured specifications, cached document trees, and readable regulation content.

## Voice interfaces

- **OpenAI Realtime** — establishing realtime voice sessions.
- **xAI / Grok Realtime** — another realtime voice-provider integration.
- **ElevenLabs** — speech-to-text and streaming text-to-speech services.

Voice has involved several approaches over time. The earlier AWS speech path is listed below rather than folded into the current voice integrations.

## Tracing, analytics, and reporting

- **Langfuse** — tracing model and agent calls, with scripts for session costs and weekly model metrics.
- **PostHog** — product events and backend error analytics.
- **Loguru** — application logging with contextual fields.
- **pandas** — working with evaluation datasets.
- **openpyxl** — reading spreadsheet-based cases and generating case workbooks.
- **ReportLab** — generating a PDF data-flow document.

These tools cover different questions: what happened inside a model call, what happened in the application, and how to turn results into something I can inspect.

## Testing and evaluation

- **pytest** — automated tests, fixtures, and the offline test suite run in CI.
- **pytest-cov and coverage.py** — coverage tooling declared in the project's dependencies.
- **DeepEval** — conversation-quality evaluation using transcripts, reference cases, and model-based judges.
- **Giskard** — a vulnerability scan of the conversation API and RAG evaluation through RAGET.
- **Locust** — load-test scenarios for the API.
- **HTTPX with asyncio** — custom concurrency probes alongside the dedicated load-test suite.

The repository keeps the Giskard evaluation environment separate from the main environment because of dependency compatibility. Evaluation tools are part of the engineering workflow, not ordinary dependencies of a user conversation.

## Infrastructure and deployment

The repository's Terraform and CI configuration describe a container deployment on AWS. This is an inventory of that infrastructure work, rather than an audit of the live AWS account.

- **Docker** — building the backend container image.
- **Terraform** — defining cloud resources and deployment configuration.
- **Amazon ECR** — the container-image registry.
- **Amazon ECS with Fargate** — the configured container runtime and service.
- **Application Load Balancer** — routing traffic to the container service.
- **AWS Certificate Manager** — the certificate integration used by the HTTPS listener.
- **Amazon DynamoDB** — shared request-quota storage in the current backend code.
- **Amazon S3** — storage used by sharing and incident-reporting features, as well as infrastructure state configuration.
- **Amazon SES and SMTP** — supported email-delivery paths.
- **Amazon CloudWatch** — container-log configuration.
- **AWS IAM and VPC networking** — permissions and the network configuration around the service.
- **boto3 and botocore** — AWS SDK clients and supporting error handling.
- **AWS CLI, Bash, and jq** — deployment scripts and command-line automation.

## Development and team workflows

- **Git and GitHub** — version control, branches, and pull requests.
- **GitHub Actions** — automated tests, builds, deployments, and scheduled policy checks.
- **uv and pip** — dependency installation and Python environment management; `uv.lock` records the locked environment.
- **Slack** — webhook notifications for deployment and policy-review workflows.
- **Jira** — creating and tracking tickets when regulation changes need engineering work.
- **cloudflared** — the documented workflow for exposing a local deployment through a temporary preview URL.

## Prototypes and optional integrations

**Typesafe AI's System One / Jev** appears in benchmarks for extraction, household-roster interpretation, and judging. The application also contains optional ambiguity observation and answer-routing integrations. I treat these as prototype and opt-in work, rather than assuming they are enabled for every conversation.

## Earlier tools and approaches

The repository history matters here. It records tools that helped explore an approach, even when that approach was later replaced or removed:

- **Google Gemini CLI** — an early regulation-query backend that invoked the CLI as a subprocess.
- **Google Generative AI SDK and its File API** — another Gemini-based document-query approach.
- **DeepAgents** — an earlier retrieval approach using planning and filesystem tools.
- **FAISS, OpenAI embeddings, and LangChain's community loaders and text splitters** — the earlier vector-search regulation backend, since removed.
- **Amazon Polly** — the earlier text-to-speech adapter.
- **Amazon Transcribe Streaming, PyAV, and NumPy** — the earlier audio transcription and decoding path, since removed.
- **SlowAPI** — an earlier rate-limiting implementation.
- **Direct SQLite quota storage** — an earlier shared quota implementation, replaced by DynamoDB. SQLite still underlies DiskCache's session store.
- **Elastic Beanstalk, EC2, Gunicorn, and nginx** — the earlier deployment path documented in the repository, with legacy deployment files still present. Those files alone don't establish whether that environment has been retired.
- **PR-Agent** — a GitHub Actions experiment for automated pull-request review that was subsequently removed.

This is a snapshot of the work so far. Keeping the current code, supporting workflows, experiments, and earlier approaches visible gives me a more useful record than a single undifferentiated list of technologies.
