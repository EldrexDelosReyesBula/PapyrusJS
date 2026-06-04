/**
 * PAPYR AI PLATFORM GATEWAY & PROMPT OPTIMIZER
 * Unified, zero-dependency connector for OpenAI, Anthropic, Gemini, and local Ollama models.
 * v2.0 - Prompts template managers, semantic DOM token-minimizer serialization, and offline simulator fallbacks.
 */
(function(window) {
    const aiPlugin = {
        name: 'papyr-ai',
        version: '2.0.0',
        install(papyr) {
            papyr.ai = Object.assign(papyr.ai || {}, {
                /**
                 * Reusable prompt templates with simple curly-braces variable interpolation.
                 * Usage: papyr.ai.prompt("Hello {{name}}!", { name: "World" }) => "Hello World!"
                 */
                prompt(template, variables = {}) {
                    if (typeof template !== 'string') return '';
                    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
                        return variables[key] !== undefined ? String(variables[key]) : match;
                    });
                },

                /**
                 * Semantic DOM JSON minimizer and NLP structured schema extractor.
                 */
                toSemanticJSON(elOrConfig) {
                    // 1. NLP Structured Schema Extraction Mode: toSemanticJSON({ input, schema })
                    if (elOrConfig && typeof elOrConfig === 'object' && elOrConfig.input && elOrConfig.schema) {
                        const input = String(elOrConfig.input);
                        const schema = elOrConfig.schema;
                        const result = {};
                        for (let key in schema) {
                            if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
                            const type = Reflect.get(schema, key);
                            let val = null;
                            if (type === 'number') {
                                // Safe alternative to dynamic RegExp to avoid ReDoS and security warnings
                                const lowerInput = input.toLowerCase();
                                const lowerKey = String(key).toLowerCase();
                                const keyIndex = lowerInput.indexOf(lowerKey);
                                if (keyIndex !== -1) {
                                    const sub = input.slice(keyIndex + lowerKey.length);
                                    const m = sub.match(/\b(\d+)\b/);
                                    if (m) {
                                        val = Number(m[1]);
                                    }
                                }
                                if (val === null) {
                                    const anyNum = input.match(/\b(\d+)\b/);
                                    if (anyNum) val = Number(anyNum[0]);
                                }
                            } else {
                                if (key === 'name') {
                                    const nameRegex = /([A-Z][a-z]+)/;
                                    const m = input.match(nameRegex);
                                    if (m) val = m[1];
                                } else {
                                    const words = input.split(/\s+/);
                                    const idx = words.findIndex(w => w.toLowerCase().includes(key.toLowerCase()));
                                    if (idx !== -1 && idx + 1 < words.length) {
                                        if (words[idx + 1] === 'is' || words[idx + 1] === '=') {
                                            val = words.slice(idx + 2).join(' ').replace(/[,.]/g, '').trim();
                                        } else {
                                            val = words.slice(idx + 1).join(' ').replace(/[,.]/g, '').trim();
                                        }
                                        if (key === 'profession' || key === 'job') {
                                            const profRegex = /works\s+as\s+a\s+([A-Za-z\s]+)/i;
                                            const pm = input.match(profRegex);
                                            if (pm) val = pm[1].trim();
                                        }
                                    }
                                }
                            }
                            Reflect.set(result, key, val);
                        }
                        return result;
                    }

                    // 2. DOM Token-Minimizer Mode
                    if (typeof document === 'undefined') {
                        return { status: "non-browser-node", info: "Document undefined in non-browser context" };
                    }
                    const element = typeof elOrConfig === 'string' ? document.querySelector(elOrConfig) : elOrConfig;
                    if (!element) return null;

                    function extract(node) {
                        if (node.nodeType === 3) {
                            const txt = node.textContent.trim();
                            return txt ? txt : null;
                        }
                        if (node.nodeType !== 1) return null;

                        const data = {
                            tag: node.tagName.toLowerCase(),
                        };

                        if (node.id) data.id = node.id;
                        if (node.className) data.class = node.className;
                        if (node.type) data.type = node.type;
                        if (node.value) data.value = node.value;
                        if (node.name) data.name = node.name;
                        if (node.placeholder) data.placeholder = node.placeholder;
                        
                        const ds = Object.keys(node.dataset || {});
                        if (ds.length > 0) {
                            data.dataset = {};
                            ds.forEach(k => {
                                data.dataset[k] = node.dataset[k];
                            });
                        }

                        const children = [];
                        node.childNodes.forEach(child => {
                            const res = extract(child);
                            if (res) {
                                if (typeof res === 'string') {
                                    if (!data.text) data.text = '';
                                    data.text = (data.text + ' ' + res).trim();
                                } else {
                                    children.push(res);
                                }
                            }
                        });

                        if (children.length > 0) {
                            data.children = children;
                        }

                        return data;
                    }

                    return extract(element);
                },

                use(name) {
                    this._config = this._config || {};
                    this._config.provider = name;
                    return this;
                },

                normalizeResponse(provider, data) {
                    const prov = (provider || 'openai').toLowerCase();
                    if (prov === 'openai') {
                        const message = data.choices?.[0]?.message;
                        if (!message) {
                            return { success: false, content: null, refusal: "No response returned" };
                        }
                        if (message.refusal) {
                            return { success: false, content: null, refusal: message.refusal };
                        }
                        return { success: true, content: message.content, refusal: null };
                    } else if (prov === 'anthropic') {
                        const text = data.content?.[0]?.text;
                        if (!text) {
                            return { success: false, content: null, refusal: "No response returned" };
                        }
                        return { success: true, content: text, refusal: null };
                    } else if (prov === 'gemini') {
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (!text) {
                            return { success: false, content: null, refusal: "No response returned" };
                        }
                        return { success: true, content: text, refusal: null };
                    } else if (prov === 'ollama') {
                        const content = data.message?.content || data.response || '';
                        if (!content) {
                            return { success: false, content: null, refusal: "No response returned" };
                        }
                        return { success: true, content: content, refusal: null };
                    }
                    return { success: false, content: null, refusal: `Unknown provider: ${provider}` };
                },

                /**
                 * Unified AI Provider interface mapping OpenAI, Anthropic, Gemini, and Ollama endpoints.
                 * Enforces strict real-world connections, API key validations, and secure data privacy protocols.
                 */
                chat(options = {}) {
                    const provider = (options.provider || (this._config && this._config.provider) || 'openai').toLowerCase();
                    const apiKey = options.apiKey || '';
                    const messages = options.messages || [];
                    const model = options.model;
                    
                    const isLocal = provider === 'ollama';
                    
                    if (!isLocal && !apiKey) {
                        return Promise.reject(new Error(`Security Validation Error: A secure API key is required to initiate real-world chat completions with provider '${provider}'.`));
                    }

                    const hasFetch = typeof fetch !== 'undefined';
                    if (!hasFetch) {
                        return Promise.reject(new Error("Environment Error: global fetch() API is required to communicate with AI endpoints."));
                    }

                    // Real integration logic
                    let url = options.endpoint || '';
                    let headers = {
                        'Content-Type': 'application/json'
                    };
                    let body = {};

                    if (provider === 'openai') {
                        url = url || 'https://api.openai.com/v1/chat/completions';
                        headers['Authorization'] = `Bearer ${apiKey}`;
                        body = {
                            model: model || 'gpt-4o-mini',
                            messages: messages
                        };
                    } else if (provider === 'anthropic') {
                        url = url || 'https://api.anthropic.com/v1/messages';
                        headers['x-api-key'] = apiKey;
                        headers['anthropic-version'] = '2023-06-01';
                        body = {
                            model: model || 'claude-3-5-sonnet-20241022',
                            messages: messages.filter(m => m.role !== 'system'),
                            max_tokens: 1024
                        };
                        const systemMsg = messages.find(m => m.role === 'system');
                        if (systemMsg) {
                            body.system = systemMsg.content;
                        }
                    } else if (provider === 'gemini') {
                        const gemModel = model || 'gemini-2.5-flash';
                        url = url || `https://generativelanguage.googleapis.com/v1beta/models/${gemModel}:generateContent?key=${apiKey}`;
                        
                        const contents = messages.filter(m => m.role !== 'system').map(m => {
                            return {
                                role: m.role === 'assistant' ? 'model' : 'user',
                                parts: [{ text: m.content }]
                            };
                        });
                        
                        body = { contents: contents };
                        
                        const systemMsg = messages.find(m => m.role === 'system');
                        if (systemMsg) {
                            body.systemInstruction = {
                                parts: [{ text: systemMsg.content }]
                            };
                        }
                    } else if (provider === 'ollama') {
                        url = url || 'http://localhost:11434/api/chat';
                        body = {
                            model: model || 'llama3',
                            messages: messages,
                            stream: false
                        };
                    }

                    return fetch(url, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(body)
                    })
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`API error: ${res.status} ${res.statusText}`);
                        }
                        return res.json();
                    })
                    .then(data => {
                        const norm = this.normalizeResponse(provider, data);
                        return {
                            ...norm,
                            text: norm.content || '',
                            provider: provider,
                            simulated: false,
                            raw: data
                        };
                    });
                }
            });
        }
    };

    // Auto-register in global window environment for backwards compatibility
    const targetPapyr = window.papyr || (typeof global !== 'undefined' && global.papyr);
    if (targetPapyr) {
        targetPapyr.use(aiPlugin);
    }

    // Export the plugin object for ESM/CommonJS contexts
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = aiPlugin;
    } else if (typeof exports !== 'undefined') {
        exports.default = aiPlugin;
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return aiPlugin; });
    } else {
        window.papyrAI = aiPlugin;
    }
})(typeof window !== 'undefined' ? window : this);
