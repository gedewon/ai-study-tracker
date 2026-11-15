/*
 * The 6-month plan, one entry per study session.
 * Sessions are placed in order on the study days of each month:
 *   Tue + Thu evenings (1.5 h), Saturday (3 h), Sunday (2 h)  →  8 h a week (inside your 8–10 h budget).
 * Mon, Wed and Fri are rest days. 24, 26 and 31 Dec are treated as holidays.
 *
 * Edit freely: tasks are [text, optional url]. Progress is stored per task
 * position, so if you reorder tasks inside a month, ticks follow the position.
 */
(function () {
  const L = {
    b3b: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi',
    introLLM: 'https://www.youtube.com/results?search_query=karpathy+intro+to+large+language+models',
    z2h: 'https://karpathy.ai/zero-to-hero.html',
    z2hPlaylist: 'https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ',
    z2hRepo: 'https://github.com/karpathy/nn-zero-to-hero',
    chip: 'https://www.oreilly.com/library/view/ai-engineering/9781098166298/',
    claudeStart: 'https://platform.claude.com/docs/en/get-started',
    openaiQuick: 'https://platform.openai.com/docs/quickstart',
    tokenCount: 'https://platform.claude.com/docs/en/build-with-claude/token-counting',
    pricing: 'https://platform.claude.com/docs/en/about-claude/pricing',
    anthPrompt: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview',
    oaiPrompt: 'https://platform.openai.com/docs/guides/prompt-engineering',
    oaiStructured: 'https://platform.openai.com/docs/guides/structured-outputs',
    toolUse: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview',
    ragCourse: 'https://www.deeplearning.ai/courses/retrieval-augmented-generation',
    fastapi: 'https://fastapi.tiangolo.com/tutorial/',
    pytest: 'https://docs.pytest.org/en/stable/getting-started.html',
    pydantic: 'https://docs.pydantic.dev/latest/',
    pgvector: 'https://github.com/pgvector/pgvector',
    pgFts: 'https://www.postgresql.org/docs/current/textsearch.html',
    faker: 'https://faker.readthedocs.io/',
    kafkaPy: 'https://github.com/confluentinc/confluent-kafka-python',
    kafkaDocker: 'https://hub.docker.com/r/apache/kafka',
    testcontainers: 'https://testcontainers-python.readthedocs.io/',
    mcpCourse: 'https://anthropic.skilljar.com/introduction-to-model-context-protocol',
    mcpBuild: 'https://modelcontextprotocol.io/docs/2026-07-28/develop/build-server',
    mcpServers: 'https://github.com/modelcontextprotocol/servers',
    mcpPy: 'https://github.com/modelcontextprotocol/python-sdk',
    docker: 'https://docs.docker.com/get-started/',
    gha: 'https://docs.github.com/en/actions',
    ruff: 'https://docs.astral.sh/ruff/',
    tfAws: 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started',
    awsBudgets: 'https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html',
    k3s: 'https://docs.k3s.io/',
    eks: 'https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html',
    agents: 'https://www.anthropic.com/research/building-effective-agents',
    agentSdk: 'https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk',
    agenticRag: 'https://www.deeplearning.ai/courses/building-agentic-rag-with-llamaindex',
    bolt: 'https://github.com/slackapi/bolt-python',
    stripeTest: 'https://docs.stripe.com/testing',
    sheets: 'https://developers.google.com/sheets/api/quickstart/python',
    hamel: 'https://hamel.dev/blog/posts/evals/index.html',
    hamelFaq: 'https://hamel.dev/blog/posts/evals-faq/',
    evalAgents: 'https://learn.deeplearning.ai/courses/evaluating-ai-agents/information',
    evalAgentic: 'https://www.deeplearning.ai/courses/evaluating-and-improving-agentic-applications',
    advRag: 'https://www.deeplearning.ai/courses/building-evaluating-advanced-rag',
    phoenix: 'https://github.com/Arize-ai/phoenix',
    caching: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
    vue: 'https://vuejs.org/guide/quick-start.html',
    vueTs: 'https://vuejs.org/guide/typescript/overview.html',
    devto: 'https://dev.to/',
    linkedin: 'https://www.linkedin.com/',
    upwork: 'https://www.upwork.com/',
    contra: 'https://contra.com/',
    toptal: 'https://www.toptal.com/',
  };

  const ETF = ['Make this month’s ETF contribution'];

  const months = [
    {
      ym: [2026, 11],
      name: 'December',
      short: 'Dec',
      title: 'LLM foundations',
      outcome: 'Explain tokens, embeddings, attention and context windows clearly to a client, and make your first API calls.',
      sessions: [
        { t: 'Kick-off: what a neural network is', tasks: [
          ['Set up a notes repo (or folder) for the next six months'],
          ['3Blue1Brown, Neural Networks ch. 1: “But what is a neural network?”', L.b3b],
          ['3Blue1Brown ch. 2: gradient descent', L.b3b],
          ETF,
        ] },
        { t: 'Backpropagation, visually', tasks: [
          ['3Blue1Brown ch. 3 and 4: backpropagation and its calculus', L.b3b],
          ['Write 5 lines in your own words: what does training actually change?'],
        ] },
        { t: 'Transformers and attention', tasks: [
          ['3Blue1Brown: “Transformers, the tech behind LLMs” (GPT chapter)', L.b3b],
          ['3Blue1Brown: “Attention in transformers, step by step”', L.b3b],
          ['Notes: explain tokens and embeddings like you would to a client'],
        ] },
        { t: 'How LLMs store facts + start the book', tasks: [
          ['3Blue1Brown: “How might LLMs store facts”', L.b3b],
          ['Chip Huyen, AI Engineering: chapter 1', L.chip],
        ] },
        { t: 'Karpathy: the big picture (part 1)', tasks: [
          ['Karpathy, “Intro to Large Language Models”: first 30 min', L.introLLM],
          ['Note the pre-training vs fine-tuning split'],
        ] },
        { t: 'Karpathy: the big picture (part 2)', tasks: [
          ['Finish “Intro to Large Language Models”', L.introLLM],
          ['Write your 5 biggest takeaways'],
        ] },
        { t: 'Foundation models, in depth', tasks: [
          ['Chip Huyen: chapter 2, Understanding foundation models', L.chip],
          ['Explain context windows and sampling (temperature, top-p) in your notes'],
          ['Draft an outline for your first blog post'],
        ] },
        { t: 'Consolidate week 1–2', tasks: [
          ['Finish chapter 2', L.chip],
          ['Re-read your notes; mark what is still fuzzy'],
        ] },
        { t: 'Zero to Hero: micrograd (part 1)', tasks: [
          ['Watch the first hour of lecture 1 (micrograd)', L.z2h],
          ['Clone the notebooks and code along', L.z2hRepo],
        ] },
        { t: 'Zero to Hero: micrograd (part 2)', tasks: [
          ['Finish lecture 1', L.z2hPlaylist],
          ['Re-implement the Value class and backward() without looking'],
        ] },
        { t: 'Let’s build GPT (part 1)', tasks: [
          ['“Let’s build GPT”: first half, coding along', L.z2h],
          ['Note how self-attention is computed in code'],
        ] },
        { t: 'Let’s build GPT (part 2)', tasks: [
          ['Finish “Let’s build GPT”', L.z2hPlaylist],
          ['Train the tiny model and generate some text'],
        ] },
        { t: 'First API calls', tasks: [
          ['Get API keys for Anthropic and OpenAI', L.claudeStart],
          ['Script: call a model and stream the response', L.openaiQuick],
        ] },
        { t: 'Tokens and cost', tasks: [
          ['Extend the script: count tokens and print the cost per call', L.tokenCount],
          ['Chip Huyen: chapter 3, Evaluation methodology', L.chip],
        ] },
        { t: 'Checkpoint: first blog post', badge: 'Checkpoint', tasks: [
          ['Write “How LLMs work, explained by a backend engineer”'],
          ['Publish it on your blog, dev.to or LinkedIn', L.devto],
        ] },
      ],
    },
    {
      ym: [2027, 0],
      name: 'January',
      short: 'Jan',
      title: 'Prompting, embeddings, RAG',
      outcome: 'Build a working RAG system over a static dataset, in Python with FastAPI, tests first.',
      sessions: [
        { t: 'Catch-up from December', tasks: [
          ['Finish anything left over from month 1 (it is fine to run into January)'],
          ETF,
        ] },
        { t: 'Prompt engineering guides', tasks: [
          ['Anthropic prompt engineering guide', L.anthPrompt],
          ['OpenAI prompt engineering guide', L.oaiPrompt],
        ] },
        { t: 'Structured outputs', tasks: [
          ['Get reliable JSON validated by a Pydantic model', L.oaiStructured],
          ['Chip Huyen: chapter 5, Prompt engineering', L.chip],
        ] },
        { t: 'Tool calls', tasks: [
          ['Read the tool-use overview', L.toolUse],
          ['Script: the model calls a fake get_price tool and uses the result'],
        ] },
        { t: 'Python stack, day one', tasks: [
          ['FastAPI tutorial: first steps to request body', L.fastapi],
          ['Set up pytest and write your first failing test', L.pytest],
          ['Create the LiveCatalog repo (Python, FastAPI, Pydantic)', L.pydantic],
        ] },
        { t: 'RAG course: overview', tasks: [
          ['DeepLearning.AI RAG course: module 1', L.ragCourse],
        ] },
        { t: 'RAG course: retrieval', tasks: [
          ['RAG course: module 2 (keyword and semantic search)', L.ragCourse],
        ] },
        { t: 'pgvector up and running', tasks: [
          ['Run Postgres + pgvector in Docker', L.pgvector],
          ['Test first: a products table with an embedding column'],
        ] },
        { t: 'Load and embed the dataset', tasks: [
          ['Pick a public e-commerce dataset or generate fake products', L.faker],
          ['Ingestion script: embed products into pgvector (with tests)'],
        ] },
        { t: 'RAG course: chunking and vector DBs', tasks: [
          ['RAG course: module 3', L.ragCourse],
        ] },
        { t: '/search endpoint', tasks: [
          ['TDD: write the test, then a /search endpoint using vector similarity', L.fastapi],
        ] },
        { t: 'Hybrid search', tasks: [
          ['Add Postgres full-text search', L.pgFts],
          ['Combine keyword and vector results (reciprocal rank fusion)'],
        ] },
        { t: 'Reranking and filters', tasks: [
          ['Add a reranker and compare results on 10 queries'],
          ['Support filters like “under $100”'],
        ] },
        { t: 'RAG course: generation', tasks: [
          ['RAG course: module 4 (prompts and LLM generation)', L.ragCourse],
        ] },
        { t: '/ask endpoint', tasks: [
          ['Retrieve, then generate an answer citing product IDs'],
          ['Tests with a mocked LLM client'],
        ] },
        { t: 'Make it answer well', tasks: [
          ['Run fuzzy queries like “waterproof hiking shoes under $100”'],
          ['Log failures and fix the worst three'],
        ] },
        { t: 'Milestone: LiveCatalog v0.1', badge: 'Milestone', tasks: [
          ['README: architecture, setup, example queries'],
          ['Push to GitHub'],
        ] },
        { t: 'Checkpoint: demo', badge: 'Checkpoint', tasks: [
          ['Record a short screen demo and link it in the README'],
          ['Month review: what was harder than expected?'],
        ] },
      ],
    },
    {
      ym: [2027, 1],
      name: 'February',
      short: 'Feb',
      title: 'Live data, MCP, deploy on AWS',
      outcome: 'Your assistant uses live data via streaming embeddings and MCP tool calls to GraphQL, and runs on AWS.',
      sessions: [
        { t: 'Kafka locally', tasks: [
          ['Run Kafka in Docker (KRaft mode)', L.kafkaDocker],
          ['Define product create/update/delete events as Pydantic models'],
          ETF,
        ] },
        { t: 'Python Kafka consumer', tasks: [
          ['Consumer with confluent-kafka', L.kafkaPy],
          ['Tests for event parsing'],
        ] },
        { t: 'Re-embed and upsert', tasks: [
          ['Re-embed changed products and upsert into pgvector; handle deletes'],
          ['Integration test with Testcontainers', L.testcontainers],
        ] },
        { t: 'Idempotency and ordering', tasks: [
          ['Key by product ID; skip stale events using a version or updated_at'],
          ['Tests for duplicate and out-of-order events'],
        ] },
        { t: 'Retries, DLQ, staleness', tasks: [
          ['Retries and a dead-letter topic'],
          ['Track embedding staleness (event time vs indexed time)'],
        ] },
        { t: 'MCP course (part 1)', tasks: [
          ['Anthropic: Introduction to Model Context Protocol, first half', L.mcpCourse],
        ] },
        { t: 'MCP course (part 2) + the spec', tasks: [
          ['Finish the MCP course', L.mcpCourse],
          ['Official guide: Build an MCP server', L.mcpBuild],
          ['Browse the reference servers', L.mcpServers],
        ] },
        { t: 'MCP server: get_product', tasks: [
          ['MCP server skeleton with the Python SDK', L.mcpPy],
          ['get_product tool wrapping your GraphQL API, test first'],
        ] },
        { t: 'MCP server: stock and price', tasks: [
          ['check_stock and get_price tools'],
          ['Input validation and read-only scopes'],
        ] },
        { t: 'Milestone: LiveCatalog v0.2', badge: 'Milestone', tasks: [
          ['Semantic search finds candidates; MCP fetches live price and stock'],
          ['Demo: change a price in Kafka, the assistant picks it up within seconds'],
        ] },
        { t: 'Containerise everything', tasks: [
          ['Dockerfiles for the API, Kafka consumer and MCP server', L.docker],
          ['One docker compose file for the whole stack'],
        ] },
        { t: 'CI', tasks: [
          ['GitHub Actions: run pytest on every push', L.gha],
          ['Add ruff for linting', L.ruff],
        ] },
        { t: 'Terraform basics', tasks: [
          ['Set an AWS budget alarm first', L.awsBudgets],
          ['Terraform AWS getting-started tutorial', L.tfAws],
        ] },
        { t: 'Infrastructure as code', tasks: [
          ['Terraform: VPC, Postgres with pgvector, container registry'],
        ] },
        { t: 'Kubernetes', tasks: [
          ['Run k3s on EC2 (cheaper) or EKS', L.k3s],
          ['Deploy the services; add basic logging and one alert', L.eks],
        ] },
        { t: 'Checkpoint: second blog post', badge: 'Checkpoint', tasks: [
          ['Write “Why your AI chatbot shows stale prices, and how streaming fixes it”'],
          ['Publish and share it on LinkedIn', L.linkedin],
        ] },
      ],
    },
    {
      ym: [2027, 2],
      name: 'March',
      short: 'Mar',
      title: 'Agents and the Slack bot',
      outcome: 'Build a tool-using agent that completes multi-step tasks and knows when to stop and ask a human.',
      sessions: [
        { t: 'Building effective agents (part 1)', tasks: [
          ['Read Anthropic’s “Building effective agents”: workflows', L.agents],
          ETF,
        ] },
        { t: 'Building effective agents (part 2)', tasks: [
          ['Finish the article: agents and when to use them', L.agents],
          ['Notes: chaining, routing, parallelisation, orchestrator-workers, evaluator-optimiser'],
        ] },
        { t: 'Agent loop by hand', tasks: [
          ['Read “Building agents with the Claude Agent SDK”', L.agentSdk],
          ['Write a tool-call loop by hand with a max-steps stop condition'],
          ['Chip Huyen: chapter 6, RAG and agents', L.chip],
        ] },
        { t: 'Agentic RAG (part 1)', tasks: [
          ['DeepLearning.AI: Building Agentic RAG with LlamaIndex, lessons 1–2', L.agenticRag],
        ] },
        { t: 'Agentic RAG (part 2)', tasks: [
          ['Finish the course (agent reasoning loop, multi-document agent)', L.agenticRag],
        ] },
        { t: 'Design the LiveCatalog agent', tasks: [
          ['Write down the tools, step limit and stop conditions'],
          ['Tests for tool selection with a mocked model'],
        ] },
        { t: 'Multi-step shopping task', tasks: [
          ['Implement “find three alternatives to this out-of-stock jacket and compare prices”'],
        ] },
        { t: 'Human checkpoint', tasks: [
          ['Every write action pauses for human approval'],
          ['Tests for the approval states'],
        ] },
        { t: 'Prompt-injection guard', tasks: [
          ['Treat product descriptions as untrusted input'],
          ['Test with a malicious product description'],
        ] },
        { t: 'Milestone: LiveCatalog v0.3', badge: 'Milestone', tasks: [
          ['Demo the multi-step shopping agent and tag the release'],
        ] },
        { t: 'Slack app', tasks: [
          ['Create a Slack app with Bolt for Python (Socket Mode)', L.bolt],
          ['The bot replies in a test channel'],
        ] },
        { t: 'Slack bot meets the agent', tasks: [
          ['Answer catalogue questions in Slack through the agent'],
        ] },
        { t: 'Write actions with approvals', tasks: [
          ['Update a price and flag low stock, with Approve/Reject buttons in Slack'],
        ] },
        { t: 'Audit log', tasks: [
          ['Log every write: who approved, when, what changed'],
          ['Tests for the audit log'],
        ] },
        { t: 'Daily report', tasks: [
          ['Post a scheduled daily catalogue report to Slack'],
        ] },
        { t: 'One more integration', tasks: [
          ['Stripe in test mode or Google Sheets', L.stripeTest],
        ] },
        { t: 'Ship the bot', tasks: [
          ['Deploy the bot to your cluster'],
          ['Update the README; month review'],
        ] },
      ],
    },
    {
      ym: [2027, 3],
      name: 'April',
      short: 'Apr',
      title: 'Evals and production quality',
      outcome: 'Prove with numbers that your system works, and catch regressions before clients do.',
      sessions: [
        { t: 'Why evals', tasks: [
          ['Hamel Husain: “Your AI Product Needs Evals”', L.hamel],
          ETF,
        ] },
        { t: 'Evals FAQ', tasks: [
          ['Work through “AI Evals: Everything You Need to Know”', L.hamelFaq],
          ['Note the ideas you will apply to LiveCatalog'],
        ] },
        { t: 'Evaluating AI agents (part 1)', tasks: [
          ['DeepLearning.AI: Evaluating AI Agents, first half', L.evalAgents],
        ] },
        { t: 'Evaluating AI agents (part 2)', tasks: [
          ['Finish Evaluating AI Agents', L.evalAgents],
        ] },
        { t: 'The RAG triad', tasks: [
          ['Building and Evaluating Advanced RAG: context relevance, groundedness, answer relevance', L.advRag],
        ] },
        { t: 'Tracing', tasks: [
          ['Optional: Evaluating and Improving Agentic Applications', L.evalAgentic],
          ['Add tracing to LiveCatalog (Arize Phoenix)', L.phoenix],
        ] },
        { t: 'Test set: first 50', tasks: [
          ['Write 50 real questions with expected answers'],
        ] },
        { t: 'Test set: to 100 + run it', tasks: [
          ['Extend to 100 questions'],
          ['Run them all and save the traces'],
        ] },
        { t: 'Error analysis', tasks: [
          ['Read traces and group failures into categories'],
          ['Pick the top two failure types to fix'],
        ] },
        { t: 'Automated checks + LLM judge', tasks: [
          ['Code-based assertions for the easy cases'],
          ['An LLM judge, checked against your own labels'],
        ] },
        { t: 'Evals in CI', tasks: [
          ['Run the eval suite on every change; fail the build on regressions', L.gha],
        ] },
        { t: 'Measure cost and latency', tasks: [
          ['Log cost and latency per query'],
        ] },
        { t: 'Make it cheaper and faster', tasks: [
          ['Add prompt caching', L.caching],
          ['Route simple queries to a cheaper model; re-measure'],
        ] },
        { t: 'Book: evaluation', tasks: [
          ['Chip Huyen: chapter 4, Evaluate AI systems', L.chip],
        ] },
        { t: 'Book: production', tasks: [
          ['Chip Huyen: chapters 9–10 (inference optimisation, architecture and feedback)', L.chip],
        ] },
        { t: 'Eval dashboard', tasks: [
          ['Dashboard for accuracy, freshness, cost and latency'],
        ] },
        { t: 'Milestone: LiveCatalog v1.0', badge: 'Milestone', tasks: [
          ['Tag v1.0 with eval numbers in the README'],
          ['Month review'],
        ] },
      ],
    },
    {
      ym: [2027, 4],
      name: 'May',
      short: 'May',
      title: 'Portfolio, offer and launch',
      outcome: 'One paying client, or at least three serious sales conversations.',
      sessions: [
        { t: 'Frontend: chat window', tasks: [
          ['Vue + TypeScript project with Vite', L.vue],
          ['Chat window talking to /ask', L.vueTs],
          ETF,
        ] },
        { t: 'Frontend: admin view', tasks: [
          ['Admin view of the eval results'],
        ] },
        { t: 'Go public', tasks: [
          ['Deploy LiveCatalog publicly (frontend + API)'],
        ] },
        { t: 'Decision doc: pgvector', tasks: [
          ['One page: why pgvector'],
        ] },
        { t: 'Decision docs + demo video', tasks: [
          ['One page each: the hybrid approach, your eval metrics'],
          ['3-minute demo: Kafka price change, live update, eval dashboard'],
        ] },
        { t: 'Case study', tasks: [
          ['Write the case study: problem, architecture, results in numbers'],
        ] },
        { t: 'Website', tasks: [
          ['Simple site: who you are, case study, offer, contact'],
        ] },
        { t: 'Define the offer', tasks: [
          ['Pick one productised service, e.g. “MCP server for your existing API in 2 weeks”'],
          ['Write scope, deliverables and timeline'],
        ] },
        { t: 'Price it', badge: 'Milestone', tasks: [
          ['Set a fixed price per package'],
          ['Publish the one-page offer on your site'],
        ] },
        { t: 'Target list', tasks: [
          ['30 e-commerce, retail or SaaS companies with product or inventory data'],
        ] },
        { t: 'Third post: draft', tasks: [
          ['Draft “How we measure whether an AI assistant tells the truth”'],
        ] },
        { t: 'Third post: publish', tasks: [
          ['Edit and publish the third post', L.devto],
        ] },
        { t: 'Outreach: batch 1', tasks: [
          ['10 personalised messages offering a free 30-minute audit', L.linkedin],
        ] },
        { t: 'Marketplace profiles', tasks: [
          ['Profiles on Upwork, Toptal or Contra, leading with the case study', L.contra],
        ] },
        { t: 'Outreach: batch 2', tasks: [
          ['10 more personalised messages'],
        ] },
        { t: 'Follow-ups', tasks: [
          ['Follow up on batch 1 and book audit calls'],
        ] },
        { t: 'Outreach: batch 3', tasks: [
          ['10 more messages; run any audit calls'],
        ] },
        { t: 'Finish line', badge: 'Checkpoint', tasks: [
          ['Review the freelance-ready checklist'],
          ['Retrospective, and plan June'],
        ] },
      ],
    },
  ];

  const checklist = [
    'Explain LLMs, embeddings and RAG to a non-technical client in five minutes',
    'A deployed RAG system over live, streaming data',
    'A working MCP server wrapping a real API',
    'An agent with tool calls and human checkpoints',
    'A Slack agent that takes real actions with approvals',
    'An eval suite with numbers you can show a client',
    'Everything in Python with FastAPI, tests written first, running in CI',
    'Deployed on AWS with Docker, Terraform and Kubernetes',
    'A Vue + TypeScript frontend and written decision docs',
    'Three published posts and one case study',
    'A defined, fixed-price offer and a list of target clients',
  ];

  window.PLAN = {
    start: '2026-12-01',
    end: '2027-05-31',
    goal: 'I connect your live business data to AI assistants and agents, reliably and measurably.',
    // study day → minutes (0 = Sunday)
    schedule: { 2: 90, 4: 90, 6: 180, 0: 120 },
    holidays: ['2026-12-24', '2026-12-26', '2026-12-31'],
    months,
    checklist,
  };
})();
