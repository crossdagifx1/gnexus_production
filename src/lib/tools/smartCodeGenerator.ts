/**
 * G-Nexus Smart Code Generator Tool
 * Advanced code generation with context awareness
 */

import type { AITool, ToolInput, ToolOutput } from '../ai-chat-types';

// Programming language templates
const LANGUAGE_TEMPLATES: Record<string, { template: string; comment: string }> = {
    python: {
        template: `def function_name(param1, param2):
    """
    Description of the function.
    
    Args:
        param1: Description of param1
        param2: Description of param2
    
    Returns:
        Description of return value
    """
    # Implementation here
    pass`,
        comment: '#',
    },
    javascript: {
        template: `/**
 * Description of the function
 * @param {type} param1 - Description of param1
 * @param {type} param2 - Description of param2
 * @returns {type} Description of return value
 */
function functionName(param1, param2) {
    // Implementation here
}`,
        comment: '//',
    },
    typescript: {
        template: `interface Params {
    param1: string;
    param2: number;
}

/**
 * Description of the function
 */
function functionName(params: Params): ReturnType {
    // Implementation here
}`,
        comment: '//',
    },
    java: {
        template: `public class ClassName {
    /**
     * Description of the method
     * @param param1 Description of param1
     * @param param2 Description of param2
     * @return Description of return value
     */
    public static ReturnType methodName(Type1 param1, Type2 param2) {
        // Implementation here
    }
}`,
        comment: '//',
    },
    rust: {
        template: `/// Description of the function
fn function_name(param1: Type1, param2: Type2) -> ReturnType {
    // Implementation here
}`,
        comment: '//',
    },
    go: {
        template: `// FunctionName description
func FunctionName(param1 type1, param2 type2) returnType {
    // Implementation here
}`,
        comment: '//',
    },
};

// Code patterns for common tasks
const CODE_PATTERNS: Record<string, { pattern: string; description: string }> = {
    'api-endpoint': {
        pattern: 'api',
        description: 'REST API endpoint',
    },
    'crud-operations': {
        pattern: 'crud',
        description: 'Create, Read, Update, Delete operations',
    },
    'authentication': {
        pattern: 'auth',
        description: 'User authentication system',
    },
    'database-connection': {
        pattern: 'database',
        description: 'Database connection and queries',
    },
    'file-handling': {
        pattern: 'file',
        description: 'File read/write operations',
    },
    'error-handling': {
        pattern: 'error',
        description: 'Error handling and logging',
    },
    'testing': {
        pattern: 'test',
        description: 'Unit tests and test cases',
    },
    'sorting-algorithm': {
        pattern: 'sort',
        description: 'Sorting algorithms',
    },
    'search-algorithm': {
        pattern: 'search',
        description: 'Search algorithms',
    },
    'data-structure': {
        pattern: 'structure',
        description: 'Data structures implementation',
    },
};

async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const smartCodeGenerator: AITool = {
    id: 'smart-code-generator',
    name: 'Smart Code Generator',
    description: 'Generate intelligent code with context awareness, supporting multiple languages and patterns',
    category: 'development',
    icon: '💻',
    keywords: ['code', 'generate', 'function', 'class', 'script', 'program', 'api', 'algorithm'],
    requiresInput: true,
    inputType: 'text',
    streamingSupported: true,
    execute: async (input: ToolInput): Promise<ToolOutput> => {
        const prompt = typeof input.content === 'string' ? input.content : '';
        await delay(1200);

        // Detect language
        let detectedLanguage = 'python';
        const languageKeywords: Record<string, string[]> = {
            python: ['python', 'def', 'import', 'self', '__init__'],
            javascript: ['javascript', 'js', 'node', 'function', 'const', 'let', 'var'],
            typescript: ['typescript', 'ts', 'interface', 'type', 'enum'],
            java: ['java', 'public', 'class', 'void', 'static'],
            rust: ['rust', 'fn', 'let mut', 'impl', 'pub'],
            go: ['golang', 'go', 'func', 'package'],
        };

        for (const [lang, keywords] of Object.entries(languageKeywords)) {
            if (keywords.some(kw => prompt.toLowerCase().includes(kw))) {
                detectedLanguage = lang;
                break;
            }
        }

        // Detect pattern
        let detectedPattern = 'general';
        for (const [pattern, info] of Object.entries(CODE_PATTERNS)) {
            if (prompt.toLowerCase().includes(info.pattern)) {
                detectedPattern = pattern;
                break;
            }
        }

        // Generate code based on pattern
        const generatedCode = generateCodeForPattern(detectedLanguage, detectedPattern, prompt);

        return {
            success: true,
            content: `## 💻 Smart Code Generation

### Detected Context
- **Language**: ${detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)}
- **Pattern**: ${detectedPattern.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
- **Complexity**: Medium

---

### Generated Code

\`\`\`${detectedLanguage}
${generatedCode}
\`\`\`

---

### 📝 Code Explanation

${generateExplanation(detectedLanguage, detectedPattern)}

### 🔧 Usage Example

\`\`\`${detectedLanguage}
${generateUsageExample(detectedLanguage, detectedPattern)}
\`\`\`

### ⚡ Performance Notes

- Time Complexity: ${getComplexity(detectedPattern).time}
- Space Complexity: ${getComplexity(detectedPattern).space}

### 📚 Related Patterns

${getRelatedPatterns(detectedPattern).map(p => `- ${p}`).join('\n')}

---

*Would you like me to modify the code, add tests, or explain any part in detail?*`,
            metadata: {
                language: detectedLanguage,
                pattern: detectedPattern,
                linesOfCode: generatedCode.split('\n').length,
                hasComments: true,
                hasTests: false,
            },
        };
    },
};

function generateCodeForPattern(language: string, pattern: string, prompt: string): string {
    const templates: Record<string, Record<string, string>> = {
        python: {
            'api-endpoint': `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    tax: Optional[float] = None

items_db = {}

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    """Retrieve an item by ID."""
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    return items_db[item_id]

@app.post("/items/{item_id}")
async def create_item(item_id: int, item: Item):
    """Create a new item."""
    if item_id in items_db:
        raise HTTPException(status_code=400, detail="Item already exists")
    items_db[item_id] = item
    return {"message": "Item created successfully", "item": item}

@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    """Update an existing item."""
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    items_db[item_id] = item
    return {"message": "Item updated successfully", "item": item}

@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    """Delete an item."""
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    deleted_item = items_db.pop(item_id)
    return {"message": "Item deleted", "item": deleted_item}`,
            'crud-operations': `from dataclasses import dataclass
from typing import List, Optional, Dict, Any
import json

@dataclass
class Entity:
    """Base entity class."""
    id: int
    name: str
    created_at: str
    
class CRUDManager:
    """Generic CRUD operations manager."""
    
    def __init__(self):
        self._items: Dict[int, Entity] = {}
        self._next_id = 1
    
    def create(self, name: str, **kwargs) -> Entity:
        """Create a new entity."""
        entity = Entity(
            id=self._next_id,
            name=name,
            created_at=datetime.now().isoformat()
        )
        self._items[self._next_id] = entity
        self._next_id += 1
        return entity
    
    def read(self, id: int) -> Optional[Entity]:
        """Read an entity by ID."""
        return self._items.get(id)
    
    def read_all(self) -> List[Entity]:
        """Read all entities."""
        return list(self._items.values())
    
    def update(self, id: int, **kwargs) -> Optional[Entity]:
        """Update an entity."""
        if id not in self._items:
            return None
        entity = self._items[id]
        for key, value in kwargs.items():
            if hasattr(entity, key):
                setattr(entity, key, value)
        return entity
    
    def delete(self, id: int) -> bool:
        """Delete an entity."""
        if id in self._items:
            del self._items[id]
            return True
        return False`,
            'sorting-algorithm': `from typing import List, TypeVar, Callable
from functools import wraps
import time

T = TypeVar('T')

def measure_time(func: Callable) -> Callable:
    """Decorator to measure execution time."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"{func.__name__} took {end - start:.6f} seconds")
        return result
    return wrapper

@measure_time
def quick_sort(arr: List[T]) -> List[T]:
    """
    Quick Sort implementation with O(n log n) average complexity.
    
    Args:
        arr: List of comparable items
        
    Returns:
        Sorted list
    """
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)

@measure_time
def merge_sort(arr: List[T]) -> List[T]:
    """
    Merge Sort implementation with O(n log n) guaranteed complexity.
    
    Args:
        arr: List of comparable items
        
    Returns:
        Sorted list
    """
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left: List[T], right: List[T]) -> List[T]:
    """Merge two sorted lists."""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
            'general': `"""
Generated Python Module
Based on your requirements, here's a comprehensive solution.
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Config:
    """Configuration settings."""
    debug: bool = False
    max_retries: int = 3
    timeout: int = 30

class Solution:
    """
    Main solution class.
    
    This class provides the core functionality based on your requirements.
    """
    
    def __init__(self, config: Optional[Config] = None):
        """Initialize with optional configuration."""
        self.config = config or Config()
        self._data: Dict[str, Any] = {}
        logger.info("Solution initialized with config: %s", self.config)
    
    def process(self, input_data: Any) -> Any:
        """
        Process the input data.
        
        Args:
            input_data: The data to process
            
        Returns:
            Processed result
        """
        try:
            # Validate input
            if not input_data:
                raise ValueError("Input data cannot be empty")
            
            # Process the data
            result = self._transform(input_data)
            
            logger.info("Processing completed successfully")
            return result
            
        except Exception as e:
            logger.error("Processing failed: %s", e)
            raise
    
    def _transform(self, data: Any) -> Any:
        """Transform the data (implement your logic here)."""
        # Add your transformation logic
        return data

# Example usage
if __name__ == "__main__":
    solution = Solution(Config(debug=True))
    result = solution.process("sample input")
    print(f"Result: {result}")`,
        },
        javascript: {
            'api-endpoint': `const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// In-memory database
const items = new Map();
let nextId = 1;

// GET /items - Retrieve all items
app.get('/items', (req, res) => {
    const allItems = Array.from(items.values());
    res.json({ success: true, data: allItems });
});

// GET /items/:id - Retrieve single item
app.get('/items/:id', (req, res) => {
    const item = items.get(parseInt(req.params.id));
    if (!item) {
        return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, data: item });
});

// POST /items - Create new item
app.post('/items', (req, res) => {
    const { name, description, price } = req.body;
    const id = nextId++;
    const item = { id, name, description, price, createdAt: new Date() };
    items.set(id, item);
    res.status(201).json({ success: true, data: item });
});

// PUT /items/:id - Update item
app.put('/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (!items.has(id)) {
        return res.status(404).json({ success: false, error: 'Item not found' });
    }
    const existing = items.get(id);
    const updated = { ...existing, ...req.body, updatedAt: new Date() };
    items.set(id, updated);
    res.json({ success: true, data: updated });
});

// DELETE /items/:id - Delete item
app.delete('/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (!items.has(id)) {
        return res.status(404).json({ success: false, error: 'Item not found' });
    }
    items.delete(id);
    res.json({ success: true, message: 'Item deleted' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,
            'general': `/**
 * Generated JavaScript Module
 * Based on your requirements, here's a comprehensive solution.
 */

class Solution {
    /**
     * Create a new Solution instance
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        this.config = {
            debug: false,
            maxRetries: 3,
            timeout: 30000,
            ...config
        };
        this.data = new Map();
    }

    /**
     * Process input data
     * @param {*} inputData - The data to process
     * @returns {*} Processed result
     */
    async process(inputData) {
        try {
            // Validate input
            if (!inputData) {
                throw new Error('Input data cannot be empty');
            }

            // Process the data
            const result = await this._transform(inputData);
            
            console.log('Processing completed successfully');
            return result;
        } catch (error) {
            console.error('Processing failed:', error);
            throw error;
        }
    }

    /**
     * Transform the data
     * @private
     */
    async _transform(data) {
        // Add your transformation logic here
        return data;
    }

    /**
     * Retry logic for async operations
     */
    async retry(fn, retries = this.config.maxRetries) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
            }
        }
    }
}

// Example usage
const solution = new Solution({ debug: true });
solution.process('sample input')
    .then(result => console.log('Result:', result))
    .catch(error => console.error('Error:', error));

module.exports = Solution;`,
        },
        typescript: {
            'api-endpoint': `import express, { Request, Response, NextFunction } from 'express';

// Types
interface Item {
    id: number;
    name: string;
    description?: string;
    price: number;
    createdAt: Date;
    updatedAt?: Date;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Express app
const app = express();
app.use(express.json());

// In-memory storage
const items = new Map<number, Item>();
let nextId = 1;

// Controllers
const getItems = (req: Request, res: Response<ApiResponse<Item[]>>) => {
    const allItems = Array.from(items.values());
    res.json({ success: true, data: allItems });
};

const getItem = (req: Request, res: Response<ApiResponse<Item>>) => {
    const id = parseInt(req.params.id);
    const item = items.get(id);
    
    if (!item) {
        return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    res.json({ success: true, data: item });
};

const createItem = (req: Request, res: Response<ApiResponse<Item>>) => {
    const { name, description, price } = req.body;
    const id = nextId++;
    const item: Item = {
        id,
        name,
        description,
        price,
        createdAt: new Date()
    };
    
    items.set(id, item);
    res.status(201).json({ success: true, data: item });
};

const updateItem = (req: Request, res: Response<ApiResponse<Item>>) => {
    const id = parseInt(req.params.id);
    const existing = items.get(id);
    
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    const updated: Item = {
        ...existing,
        ...req.body,
        updatedAt: new Date()
    };
    
    items.set(id, updated);
    res.json({ success: true, data: updated });
};

const deleteItem = (req: Request, res: Response<ApiResponse<void>>) => {
    const id = parseInt(req.params.id);
    
    if (!items.has(id)) {
        return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    items.delete(id);
    res.json({ success: true });
};

// Routes
app.get('/items', getItems);
app.get('/items/:id', getItem);
app.post('/items', createItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

export default app;`,
            'general': `/**
 * Generated TypeScript Module
 * Based on your requirements, here's a comprehensive solution.
 */

// Types
interface Config {
    debug: boolean;
    maxRetries: number;
    timeout: number;
}

interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Default configuration
const DEFAULT_CONFIG: Config = {
    debug: false,
    maxRetries: 3,
    timeout: 30000
};

/**
 * Main Solution class
 */
export class Solution<T = unknown> {
    private config: Config;
    private data: Map<string, T>;

    constructor(config: Partial<Config> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.data = new Map();
    }

    /**
     * Process input data
     */
    async process(inputData: T): Promise<Result<T>> {
        try {
            if (!inputData) {
                throw new Error('Input data cannot be empty');
            }

            const result = await this.transform(inputData);
            
            if (this.config.debug) {
                console.log('Processing completed successfully');
            }
            
            return { success: true, data: result };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('Processing failed:', message);
            return { success: false, error: message };
        }
    }

    /**
     * Transform the data
     */
    private async transform(data: T): Promise<T> {
        // Add your transformation logic here
        return data;
    }

    /**
     * Retry logic for async operations
     */
    async retry<R>(
        fn: () => Promise<R>,
        retries: number = this.config.maxRetries
    ): Promise<R> {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
            }
        }
        throw new Error('Retry failed');
    }
}

// Example usage
const solution = new Solution<string>({ debug: true });
solution.process('sample input')
    .then(result => console.log('Result:', result))
    .catch(error => console.error('Error:', error));`,
        },
    };

    // Get the appropriate template
    const langTemplates = templates[language] || templates.python;
    return langTemplates[pattern] || langTemplates['general'];
}

function generateExplanation(language: string, pattern: string): string {
    const explanations: Record<string, string> = {
        'api-endpoint': `This code implements a RESTful API with standard CRUD operations:
- **GET** endpoints for retrieving data
- **POST** for creating new resources
- **PUT** for updating existing resources
- **DELETE** for removing resources

The implementation includes proper error handling and HTTP status codes.`,
        'crud-operations': `This implementation provides a complete CRUD (Create, Read, Update, Delete) interface:
- **Create**: Add new entities with auto-generated IDs
- **Read**: Retrieve single or all entities
- **Update**: Modify existing entities
- **Delete**: Remove entities from storage

Uses a dataclass/entity pattern for type safety.`,
        'sorting-algorithm': `This code implements efficient sorting algorithms:
- **Quick Sort**: Average O(n log n) complexity, in-place sorting
- **Merge Sort**: Guaranteed O(n log n) complexity, stable sort

Both implementations include timing decorators for performance analysis.`,
        'general': `This is a general-purpose solution template that includes:
- **Configuration**: Customizable settings via config object
- **Error Handling**: Try-catch blocks with logging
- **Type Safety**: Type hints for better code quality
- **Documentation**: Docstrings for all public methods

Customize the \`process\` and \`_transform\` methods for your specific use case.`,
    };

    return explanations[pattern] || explanations['general'];
}

function generateUsageExample(language: string, pattern: string): string {
    const examples: Record<string, Record<string, string>> = {
        python: {
            'api-endpoint': `# Run the server
# uvicorn main:app --reload

# Test with curl
curl -X POST "http://localhost:8000/items/1" \\
    -H "Content-Type: application/json" \\
    -d '{"name": "Widget", "price": 19.99}'

curl "http://localhost:8000/items/1"`,
            'crud-operations': `# Create manager instance
manager = CRUDManager()

# Create
item = manager.create("Widget", price=19.99)

# Read
retrieved = manager.read(item.id)

# Update
updated = manager.update(item.id, price=24.99)

# Delete
manager.delete(item.id)`,
            'sorting-algorithm': `# Test sorting
import random

data = [random.randint(1, 1000) for _ in range(1000)]

sorted_data = quick_sort(data.copy())
print(f"Quick sort result: {sorted_data[:10]}...")

sorted_data = merge_sort(data.copy())
print(f"Merge sort result: {sorted_data[:10]}...")`,
            'general': `# Create instance with custom config
config = Config(debug=True, max_retries=5)
solution = Solution(config)

# Process data
result = solution.process("your input data")
print(f"Result: {result}")`,
        },
        javascript: {
            'api-endpoint': `// Run the server
// node server.js

// Test with fetch
fetch('http://localhost:3000/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Widget', price: 19.99 })
})
.then(r => r.json())
.then(console.log);`,
            'general': `// Create instance
const solution = new Solution({ debug: true });

// Process data
const result = await solution.process('your input data');
console.log('Result:', result);`,
        },
        typescript: {
            'api-endpoint': `// Run the server
// ts-node server.ts

// Test with fetch
const response = await fetch('http://localhost:3000/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Widget', price: 19.99 })
});
const data = await response.json();
console.log(data);`,
            'general': `// Create instance with types
const solution = new Solution<string>({ debug: true });

// Process data
const result = await solution.process('your input data');
if (result.success) {
    console.log('Result:', result.data);
}`,
        },
    };

    const langExamples = examples[language] || examples.python;
    return langExamples[pattern] || langExamples['general'];
}

function getComplexity(pattern: string): { time: string; space: string } {
    const complexities: Record<string, { time: string; space: string }> = {
        'api-endpoint': { time: 'O(1) for single item, O(n) for list', space: 'O(n)' },
        'crud-operations': { time: 'O(1) average', space: 'O(n)' },
        'sorting-algorithm': { time: 'O(n log n)', space: 'O(n) for merge sort, O(log n) for quick sort' },
        'search-algorithm': { time: 'O(log n) for binary search', space: 'O(1)' },
        'general': { time: 'Depends on implementation', space: 'Depends on implementation' },
    };

    return complexities[pattern] || complexities['general'];
}

function getRelatedPatterns(pattern: string): string[] {
    const related: Record<string, string[]> = {
        'api-endpoint': ['Authentication', 'Rate Limiting', 'Caching', 'Validation'],
        'crud-operations': ['Repository Pattern', 'Unit of Work', 'Data Mapper'],
        'sorting-algorithm': ['Binary Search', 'Graph Traversal', 'Dynamic Programming'],
        'search-algorithm': ['Sorting', 'Hash Tables', 'Trees'],
        'general': ['Error Handling', 'Logging', 'Testing', 'Documentation'],
    };

    return related[pattern] || related['general'];
}

export default smartCodeGenerator;
