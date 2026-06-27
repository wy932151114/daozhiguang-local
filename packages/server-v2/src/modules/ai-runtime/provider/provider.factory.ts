/* =========================================================================
 * ProviderFactory — AI Provider registry & factory
 *
 * Manages the lifecycle of all AI providers. Reads API keys from
 * environment variables (via ConfigService) and configures each provider
 * during module initialisation.
 * ========================================================================= */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, AIProviderConfig } from '../interface/ai-provider.interface';
import { OpenAIProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';
import { DeepSeekProvider } from './deepseek.provider';
import { QwenProvider } from './qwen.provider';
import { ClaudeProvider } from './claude.provider';
import { MCPProvider } from './mcp.provider';

@Injectable()
export class ProviderFactory {
  private readonly logger = new Logger(ProviderFactory.name);
  private providers: Map<string, AIProvider> = new Map();
  private initialised = false;

  constructor(private readonly configService: ConfigService) {
    // Providers are registered lazily — call registerBuiltins() during
    // onModuleInit or register() individually.
  }

  /* -----------------------------------------------------------------------
   * Registration
   * ----------------------------------------------------------------------- */

  register(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
    this.logger.log(`Registered provider: ${provider.name} (${provider.displayName})`);
  }

  getProvider(name: string): AIProvider | null {
    return this.providers.get(name) ?? null;
  }

  getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getConfiguredProviders(): AIProvider[] {
    return this.getAllProviders().filter((p) => p.isConfigured());
  }

  /* -----------------------------------------------------------------------
   * Factory — create a single provider by name
   * ----------------------------------------------------------------------- */

  createProvider(name: string): AIProvider {
    switch (name) {
      case 'openai':
        return new OpenAIProvider();
      case 'gemini':
        return new GeminiProvider();
      case 'deepseek':
        return new DeepSeekProvider();
      case 'qwen':
        return new QwenProvider();
      case 'claude':
        return new ClaudeProvider();
      case 'mcp':
        return new MCPProvider();
      default:
        throw new Error(`Unknown provider: ${name}`);
    }
  }

  /* -----------------------------------------------------------------------
   * Register built-in providers
   *
   * Call this from onModuleInit() of the parent module.
   * ----------------------------------------------------------------------- */

  registerBuiltins(): void {
    if (this.initialised) {
      this.logger.warn('registerBuiltins() called more than once — skipping');
      return;
    }

    const envKeyMap: Array<{
      provider: AIProvider;
      envKey: string;
      extraConfig?: Record<string, any>;
    }> = [
      { provider: new OpenAIProvider(), envKey: 'OPENAI_API_KEY' },
      { provider: new GeminiProvider(), envKey: 'GEMINI_API_KEY' },
      { provider: new DeepSeekProvider(), envKey: 'DEEPSEEK_API_KEY' },
      { provider: new QwenProvider(), envKey: 'QWEN_API_KEY' },
      { provider: new ClaudeProvider(), envKey: 'CLAUDE_API_KEY' },
      { provider: new MCPProvider(), envKey: 'MCP_ENDPOINT', extraConfig: { endpoint: true } },
    ];

    for (const { provider, envKey, extraConfig } of envKeyMap) {
      const apiKey = this.configService.get<string>(envKey) || process.env[envKey] || '';
      const baseUrl = this.configService.get<string>(`${provider.name.toUpperCase()}_BASE_URL`) || undefined;
      const timeout = this.configService.get<number>(`${provider.name.toUpperCase()}_TIMEOUT`) || undefined;

      if (apiKey) {
        const config: AIProviderConfig = {
          apiKey,
          ...(baseUrl ? { baseUrl } : {}),
          ...(timeout ? { timeout } : {}),
          ...extraConfig,
        };

        provider.configure(config);
        this.logger.log(
          `Configured provider "${provider.name}" with API key ` +
          `(${apiKey.slice(0, 8)}...${apiKey.slice(-4)})`,
        );
      } else {
        this.logger.warn(
          `Provider "${provider.name}" skipped — environment variable ${envKey} not set. ` +
          `Generate / health checks will report the provider as unconfigured.`,
        );
      }

      this.register(provider);
    }

    this.initialised = true;
    this.logger.log(
      `Provider factory initialised — ${this.getAllProviders().length} providers registered, ` +
      `${this.getConfiguredProviders().length} configured.`,
    );
  }
}
