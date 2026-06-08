import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
};

export type OutputSchema = {
  name: string;
  strict?: boolean;
  schema: JsonSchema;
};

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | {
      type: "json_schema";
      json_schema: OutputSchema;
    };

const normalizeMessage = (msg: Message): Message => {
  if (typeof msg.content === "string") {
    return msg;
  }
  if (Array.isArray(msg.content)) {
    return msg;
  }
  return {
    ...msg,
    content: [msg.content],
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): ToolChoice | undefined => {
  if (!toolChoice) return undefined;
  if (typeof toolChoice === "string") return toolChoice;
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }
  return toolChoice;
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}): ResponseFormat | undefined => {
  const format = responseFormat || response_format;
  const schema = outputSchema || output_schema;

  if (format) return format;
  if (schema) {
    return {
      type: "json_schema",
      json_schema: schema,
    };
  }
  return undefined;
};

interface ApiConfig {
  url: string;
  key: string;
  model: string;
  isAnthropic: boolean;
}

function getApiConfig(): ApiConfig {
  const provider = ENV.llmProvider;
  const key = ENV.llmApiKey;
  const model = ENV.llmModel;

  if (ENV.llmBaseUrl) {
    return {
      url: `${ENV.llmBaseUrl.replace(/\/+$/, "")}/v1/chat/completions`,
      key,
      model: model || "gpt-4o-mini",
      isAnthropic: false,
    };
  }
  
  switch (provider) {
    case "openai":
      return {
        url: "https://api.openai.com/v1/chat/completions",
        key,
        model: model || "gpt-4o-mini",
        isAnthropic: false,
      };
    case "anthropic":
      return {
        url: "https://api.anthropic.com/v1/messages",
        key,
        model: model || "claude-sonnet-4-20250514",
        isAnthropic: true,
      };
    case "gemini":
    default:
      return {
        url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        key,
        model: model || "gemini-2.5-flash",
        isAnthropic: false,
      };
  }
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const config = getApiConfig();
  
  const payload: Record<string, unknown> = {
    model: config.model,
    messages: params.messages.map(normalizeMessage),
    max_tokens: 32768,
  };
  
  if (params.tools && params.tools.length > 0) {
    payload.tools = params.tools;
  }
  
  const normalizedToolChoice = normalizeToolChoice(
    params.toolChoice || params.tool_choice,
    params.tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat: params.responseFormat,
    response_format: params.response_format,
    outputSchema: params.outputSchema,
    output_schema: params.output_schema,
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  
  if (config.isAnthropic) {
    headers["x-api-key"] = config.key;
    headers["anthropic-version"] = "2023-06-01";
  } else {
    headers["authorization"] = `Bearer ${config.key}`;
  }
  
  const response = await fetch(config.url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`);
  }
  
  return (await response.json()) as InvokeResult;
}
