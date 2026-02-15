/**
 * Code Generator Service
 * Generates code artifacts from workflow analysis
 */

export interface GeneratedFile {
    name: string;
    path: string;
    content: string;
    language: string;
}

export interface CodeGenerationRequest {
    type: 'react-component' | 'express-api' | 'python-script' | 'html-page' | 'generic';
    name: string;
    requirements: string;
    style?: 'typescript' | 'javascript' | 'python';
    includeTests?: boolean;
    includeStyles?: boolean;
}

export interface CodeGenerationResult {
    success: boolean;
    files?: GeneratedFile[];
    error?: string;
    suggestion?: string;
}

/**
 * Analyze workflow results and suggest code generation
 */
export async function suggestCodeGeneration(blueprint: string): Promise<{
    recommended: boolean;
    type?: CodeGenerationRequest['type'];
    suggestion?: string;
}> {
    // Check if blueprint mentions code-related keywords
    const codeKeywords = ['component', 'api', 'function', 'class', 'script', 'app', 'build', 'create', 'implement'];
    const hasCodeIntent = codeKeywords.some(kw => blueprint.toLowerCase().includes(kw));

    if (!hasCodeIntent) {
        return { recommended: false };
    }

    // Determine type
    let type: CodeGenerationRequest['type'] = 'generic';
    if (blueprint.includes('react') || blueprint.includes('component')) {
        type = 'react-component';
    } else if (blueprint.includes('api') || blueprint.includes('endpoint') || blueprint.includes('express')) {
        type = 'express-api';
    } else if (blueprint.includes('python') || blueprint.includes('script')) {
        type = 'python-script';
    } else if (blueprint.includes('html') || blueprint.includes('webpage')) {
        type = 'html-page';
    }

    return {
        recommended: true,
        type,
        suggestion: `Generate ${type.replace('-', ' ')} based on workflow analysis?`
    };
}

/**
 * Generate code from workflow analysis
 */
export async function generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    try {
        console.log(`[CodeGenerator] Generating ${request.type}: ${request.name}`);

        const files: GeneratedFile[] = [];

        // Use AI to generate code
        const { generateText } = await import('./ai');

        switch (request.type) {
            case 'react-component':
                files.push(...await generateReactComponent(request, generateText));
                break;
            case 'express-api':
                files.push(...await generateExpressAPI(request, generateText));
                break;
            case 'python-script':
                files.push(...await generatePythonScript(request, generateText));
                break;
            case 'html-page':
                files.push(...await generateHTMLPage(request, generateText));
                break;
            default:
                files.push(...await generateGenericCode(request, generateText));
        }

        return {
            success: true,
            files,
            suggestion: `Generated ${files.length} file(s) for ${request.name}`
        };

    } catch (error: any) {
        console.error('[CodeGenerator] Error:', error);
        return {
            success: false,
            error: error.message || 'Code generation failed'
        };
    }
}

/**
 * Generate React component
 */
async function generateReactComponent(
    request: CodeGenerationRequest,
    generateText: any
): Promise<GeneratedFile[]> {
    const isTS = request.style === 'typescript';
    const ext = isTS ? 'tsx' : 'jsx';

    const prompt = `Generate a professional React ${isTS ? 'TypeScript' : 'JavaScript'} component based on these requirements:

${request.requirements}

Component name: ${request.name}

Requirements:
- Use functional component with hooks
- Include proper TypeScript types (if TS)
- Add prop validation
- Include helpful comments
- Follow React best practices
- Make it production-ready

Return ONLY the code, no explanations.`;

    const result = await generateText('agentic', prompt, {
        temperature: 0.3,
        max_new_tokens: 1500
    });

    if (!result.success || !result.data) {
        throw new Error('Failed to generate component');
    }

    let code = result.data.trim();

    // Clean up code blocks
    if (code.startsWith('```')) {
        code = code.replace(/^```(?:tsx|jsx|typescript|javascript)?\n?/i, '').replace(/\n?```$/, '');
    }

    const files: GeneratedFile[] = [{
        name: `${request.name}.${ext}`,
        path: `src/components/${request.name}.${ext}`,
        content: code,
        language: isTS ? 'typescript' : 'javascript'
    }];

    // Add styles if requested
    if (request.includeStyles) {
        files.push({
            name: `${request.name}.module.css`,
            path: `src/components/${request.name}.module.css`,
            content: generateComponentStyles(request.name),
            language: 'css'
        });
    }

    return files;
}

/**
 * Generate Express API
 */
async function generateExpressAPI(
    request: CodeGenerationRequest,
    generateText: any
): Promise<GeneratedFile[]> {
    const isTS = request.style === 'typescript';
    const ext = isTS ? 'ts' : 'js';

    const prompt = `Generate production-ready Express.js ${isTS ? 'TypeScript' : 'JavaScript'} API routes based on these requirements:

${request.requirements}

API name: ${request.name}

Requirements:
- RESTful design
- Proper error handling
- Input validation
- TypeScript types (if TS)
- Async/await
- Clean code structure

Return ONLY the code, no explanations.`;

    const result = await generateText('agentic', prompt, {
        temperature: 0.3,
        max_new_tokens: 1500
    });

    if (!result.success || !result.data) {
        throw new Error('Failed to generate API');
    }

    let code = result.data.trim();
    if (code.startsWith('```')) {
        code = code.replace(/^```(?:ts|js|typescript|javascript)?\n?/i, '').replace(/\n?```$/, '');
    }

    return [{
        name: `${request.name}.${ext}`,
        path: `src/routes/${request.name}.${ext}`,
        content: code,
        language: isTS ? 'typescript' : 'javascript'
    }];
}

/**
 * Generate Python script
 */
async function generatePythonScript(
    request: CodeGenerationRequest,
    generateText: any
): Promise<GeneratedFile[]> {
    const prompt = `Generate a production-ready Python script based on these requirements:

${request.requirements}

Script name: ${request.name}

Requirements:
- Clean, Pythonic code
- Proper error handling
- Type hints
- Docstrings
- CLI interface if applicable

Return ONLY the code, no explanations.`;

    const result = await generateText('agentic', prompt, {
        temperature: 0.3,
        max_new_tokens: 1500
    });

    if (!result.success || !result.data) {
        throw new Error('Failed to generate script');
    }

    let code = result.data.trim();
    if (code.startsWith('```')) {
        code = code.replace(/^```(?:python|py)?\n?/i, '').replace(/\n?```$/, '');
    }

    return [{
        name: `${request.name}.py`,
        path: `${request.name}.py`,
        content: code,
        language: 'python'
    }];
}

/**
 * Generate HTML page
 */
async function generateHTMLPage(
    request: CodeGenerationRequest,
    generateText: any
): Promise<GeneratedFile[]> {
    const prompt = `Generate a modern HTML page with embedded CSS based on these requirements:

${request.requirements}

Page name: ${request.name}

Requirements:
- Semantic HTML5
- Modern CSS (flexbox/grid)
- Responsive design
- Clean, professional styling
- No external dependencies

Return ONLY the HTML code, no explanations.`;

    const result = await generateText('agentic', prompt, {
        temperature: 0.4,
        max_new_tokens: 2000
    });

    if (!result.success || !result.data) {
        throw new Error('Failed to generate HTML');
    }

    let code = result.data.trim();
    if (code.startsWith('```')) {
        code = code.replace(/^```(?:html)?\n?/i, '').replace(/\n?```$/, '');
    }

    return [{
        name: `${request.name}.html`,
        path: `${request.name}.html`,
        content: code,
        language: 'html'
    }];
}

/**
 * Generate generic code
 */
async function generateGenericCode(
    request: CodeGenerationRequest,
    generateText: any
): Promise<GeneratedFile[]> {
    const prompt = `Generate production-ready code based on these requirements:

${request.requirements}

Name: ${request.name}

Create clean, well-structured code following best practices.
Return ONLY the code, no explanations.`;

    const result = await generateText('agentic', prompt, {
        temperature: 0.3,
        max_new_tokens: 1500
    });

    if (!result.success || !result.data) {
        throw new Error('Failed to generate code');
    }

    let code = result.data.trim();
    if (code.startsWith('```')) {
        code = code.replace(/^```\w*\n?/i, '').replace(/\n?```$/, '');
    }

    return [{
        name: `${request.name}.txt`,
        path: `${request.name}.txt`,
        content: code,
        language: 'plaintext'
    }];
}

/**
 * Generate CSS for component
 */
function generateComponentStyles(componentName: string): string {
    return `.${componentName.toLowerCase()} {
  /* Container styles */
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.${componentName.toLowerCase()}__header {
  /* Header styles */
  font-size: 1.5rem;
  font-weight: 600;
}

.${componentName.toLowerCase()}__content {
  /* Content styles */
  padding: 1rem;
}
`;
}
