/**
 * Prompt Templates for DiagramatIQ
 * Predefined prompts for different diagram types to improve AI generation quality
 */

import { DiagramContext } from '@/types/ai';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: DiagramCategory;
  language: 'mermaid' | 'plantuml' | 'graphviz';
  systemPrompt: string;
  userPromptTemplate: string;
  examples: PromptExample[];
  tags: string[];
}

export interface PromptExample {
  input: string;
  expectedOutput: string;
  description: string;
}

export type DiagramCategory = 
  | 'flowchart'
  | 'sequence'
  | 'class'
  | 'entity-relationship'
  | 'network'
  | 'architecture'
  | 'process'
  | 'organizational'
  | 'timeline'
  | 'mindmap';

/**
 * Mermaid Templates
 */
export const MERMAID_TEMPLATES: PromptTemplate[] = [
  {
    id: 'mermaid-flowchart',
    name: 'Flowchart',
    description: 'Process flows, decision trees, and workflow diagrams',
    category: 'flowchart',
    language: 'mermaid',
    systemPrompt: `You are an expert at creating Mermaid flowchart diagrams. Create clear, logical flowcharts that show process flows, decision points, and outcomes.

FLOWCHART BEST PRACTICES:
- Use descriptive node labels
- Include decision points with Yes/No branches
- Show clear start and end points
- Use appropriate node shapes (rectangles for processes, diamonds for decisions, circles for start/end)
- Keep the flow logical and easy to follow

MERMAID FLOWCHART SYNTAX:
- flowchart TD (top-down) or LR (left-right)
- A[Rectangle] for processes
- B{Diamond} for decisions
- C((Circle)) for start/end
- D[/Parallelogram/] for input/output
- Arrows: --> (solid), -.-> (dotted), ==> (thick)`,
    userPromptTemplate: `Create a flowchart diagram for: {prompt}

Requirements:
- Use clear, descriptive labels
- Include decision points where appropriate
- Show the complete process flow
- Use proper Mermaid flowchart syntax`,
    examples: [
      {
        input: 'User login process',
        expectedOutput: `flowchart TD
    A((Start)) --> B[Enter Credentials]
    B --> C{Valid Credentials?}
    C -->|Yes| D[Generate Session]
    C -->|No| E[Show Error]
    E --> B
    D --> F[Redirect to Dashboard]
    F --> G((End))`,
        description: 'Simple login flow with validation and error handling'
      }
    ],
    tags: ['process', 'workflow', 'decision', 'business-logic']
  },
  {
    id: 'mermaid-sequence',
    name: 'Sequence Diagram',
    description: 'Interactions between different actors or systems over time',
    category: 'sequence',
    language: 'mermaid',
    systemPrompt: `You are an expert at creating Mermaid sequence diagrams. Create clear interaction diagrams that show how different actors, systems, or components communicate over time.

SEQUENCE DIAGRAM BEST PRACTICES:
- Identify all participants clearly
- Show the chronological order of interactions
- Include both requests and responses
- Use appropriate arrow types for different message types
- Add notes for important details
- Group related interactions with boxes

MERMAID SEQUENCE SYNTAX:
- participant A as Actor Name
- A->>B: Synchronous message
- A-->>B: Asynchronous message
- A-xB: Message with failure
- Note over A,B: Important note
- rect rgb(200, 200, 200): Group interactions`,
    userPromptTemplate: `Create a sequence diagram for: {prompt}

Requirements:
- Identify all participants/actors
- Show the complete interaction flow
- Include both requests and responses
- Use appropriate message types
- Add notes for complex interactions`,
    examples: [
      {
        input: 'API authentication flow',
        expectedOutput: `sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth API
    participant D as Database
    
    U->>F: Login Request
    F->>A: POST /auth/login
    A->>D: Validate Credentials
    D-->>A: User Data
    A->>A: Generate JWT Token
    A-->>F: Token + User Info
    F-->>U: Login Success`,
        description: 'API authentication with JWT token generation'
      }
    ],
    tags: ['api', 'authentication', 'interaction', 'system-design']
  },
  {
    id: 'mermaid-class',
    name: 'Class Diagram',
    description: 'Object-oriented design, classes, and their relationships',
    category: 'class',
    language: 'mermaid',
    systemPrompt: `You are an expert at creating Mermaid class diagrams. Create well-structured class diagrams that show object-oriented designs, including classes, attributes, methods, and relationships.

CLASS DIAGRAM BEST PRACTICES:
- Define clear class responsibilities
- Show appropriate visibility (public +, private -, protected #)
- Include important attributes and methods
- Show relationships with correct cardinality
- Use inheritance and composition appropriately
- Group related classes logically

MERMAID CLASS SYNTAX:
- class ClassName
- ClassName : +attribute type
- ClassName : +method() returnType
- ClassA --|> ClassB : inheritance
- ClassA --* ClassB : composition
- ClassA --o ClassB : aggregation
- ClassA --> ClassB : association`,
    userPromptTemplate: `Create a class diagram for: {prompt}

Requirements:
- Define clear class structures
- Include important attributes and methods
- Show relationships between classes
- Use appropriate visibility modifiers
- Follow object-oriented design principles`,
    examples: [
      {
        input: 'E-commerce order system',
        expectedOutput: `classDiagram
    class Customer {
        +String name
        +String email
        +String address
        +placeOrder()
        +viewOrders()
    }
    
    class Order {
        +String orderId
        +Date orderDate
        +OrderStatus status
        +calculateTotal()
        +updateStatus()
    }
    
    class Product {
        +String productId
        +String name
        +Double price
        +Integer stock
        +updateStock()
    }
    
    Customer ||--o{ Order : places
    Order ||--o{ Product : contains`,
        description: 'Basic e-commerce system with customers, orders, and products'
      }
    ],
    tags: ['oop', 'design', 'architecture', 'relationships']
  },
  {
    id: 'mermaid-er',
    name: 'Entity Relationship',
    description: 'Database design and entity relationships',
    category: 'entity-relationship',
    language: 'mermaid',
    systemPrompt: `You are an expert at creating Mermaid entity relationship diagrams. Create clear database designs that show entities, attributes, and relationships with proper cardinality.

ER DIAGRAM BEST PRACTICES:
- Define entities with clear names
- Include key attributes for each entity
- Show primary and foreign keys
- Use correct relationship cardinality
- Normalize the design appropriately
- Include important constraints

MERMAID ER SYNTAX:
- ENTITY_NAME {
    type attribute_name PK
    type attribute_name FK
  }
- ENTITY1 ||--o{ ENTITY2 : relationship_name`,
    userPromptTemplate: `Create an entity relationship diagram for: {prompt}

Requirements:
- Define all necessary entities
- Include key attributes and data types
- Show relationships with correct cardinality
- Identify primary and foreign keys
- Follow database design best practices`,
    examples: [
      {
        input: 'Blog system database',
        expectedOutput: `erDiagram
    USER {
        int user_id PK
        string username
        string email
        string password_hash
        datetime created_at
    }
    
    POST {
        int post_id PK
        int user_id FK
        string title
        text content
        datetime published_at
        boolean is_published
    }
    
    COMMENT {
        int comment_id PK
        int post_id FK
        int user_id FK
        text content
        datetime created_at
    }
    
    USER ||--o{ POST : writes
    USER ||--o{ COMMENT : makes
    POST ||--o{ COMMENT : has`,
        description: 'Simple blog system with users, posts, and comments'
      }
    ],
    tags: ['database', 'schema', 'relationships', 'data-modeling']
  },
  {
    id: 'mermaid-gitgraph',
    name: 'Git Graph',
    description: 'Git branching strategies and version control flows',
    category: 'process',
    language: 'mermaid',
    systemPrompt: `You are an expert at creating Mermaid git graphs. Create clear version control diagrams that show branching strategies, merges, and development workflows.

GIT GRAPH BEST PRACTICES:
- Show clear branch naming conventions
- Include important commits and merges
- Demonstrate the development workflow
- Show feature branches, releases, and hotfixes
- Use descriptive commit messages

MERMAID GITGRAPH SYNTAX:
- gitGraph
- commit id: "message"
- branch feature-name
- checkout feature-name
- merge main`,
    userPromptTemplate: `Create a git graph diagram for: {prompt}

Requirements:
- Show the complete branching strategy
- Include important commits and merges
- Use clear branch names
- Demonstrate the workflow process
- Follow git best practices`,
    examples: [
      {
        input: 'Feature development workflow',
        expectedOutput: `gitGraph
    commit id: "Initial commit"
    commit id: "Setup project structure"
    branch feature/user-auth
    checkout feature/user-auth
    commit id: "Add login form"
    commit id: "Implement authentication"
    checkout main
    commit id: "Update documentation"
    merge feature/user-auth
    commit id: "Release v1.1.0"`,
        description: 'Feature branch workflow with merge back to main'
      }
    ],
    tags: ['git', 'workflow', 'version-control', 'development']
  }
];

/**
 * PlantUML Templates (for future implementation)
 */
export const PLANTUML_TEMPLATES: PromptTemplate[] = [
  {
    id: 'plantuml-component',
    name: 'Component Diagram',
    description: 'System architecture and component relationships',
    category: 'architecture',
    language: 'plantuml',
    systemPrompt: `You are an expert at creating PlantUML component diagrams. Create clear architectural diagrams that show system components and their interfaces.

COMPONENT DIAGRAM BEST PRACTICES:
- Define clear component boundaries
- Show interfaces and dependencies
- Group related components
- Use appropriate stereotypes
- Show data flow between components

PLANTUML COMPONENT SYNTAX:
- [Component Name]
- interface "Interface Name" as IN
- Component1 --> Component2
- package "Package Name" {}`,
    userPromptTemplate: `Create a component diagram for: {prompt}

Requirements:
- Define all system components
- Show interfaces and dependencies
- Group related components logically
- Use clear naming conventions
- Follow architectural best practices`,
    examples: [
      {
        input: 'Microservices architecture',
        expectedOutput: `@startuml
package "Frontend" {
  [Web App]
  [Mobile App]
}

package "API Gateway" {
  [Gateway Service]
}

package "Microservices" {
  [User Service]
  [Order Service]
  [Payment Service]
}

package "Data Layer" {
  database "User DB"
  database "Order DB"
  database "Payment DB"
}

[Web App] --> [Gateway Service]
[Mobile App] --> [Gateway Service]
[Gateway Service] --> [User Service]
[Gateway Service] --> [Order Service]
[Gateway Service] --> [Payment Service]
[User Service] --> [User DB]
[Order Service] --> [Order DB]
[Payment Service] --> [Payment DB]
@enduml`,
        description: 'Microservices architecture with API gateway'
      }
    ],
    tags: ['architecture', 'microservices', 'components', 'system-design']
  }
];

/**
 * Get all available templates
 */
export const getAllTemplates = (): PromptTemplate[] => {
  return [...MERMAID_TEMPLATES, ...PLANTUML_TEMPLATES];
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: DiagramCategory): PromptTemplate[] => {
  return getAllTemplates().filter(template => template.category === category);
};

/**
 * Get templates by language
 */
export const getTemplatesByLanguage = (language: 'mermaid' | 'plantuml' | 'graphviz'): PromptTemplate[] => {
  return getAllTemplates().filter(template => template.language === language);
};

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): PromptTemplate | undefined => {
  return getAllTemplates().find(template => template.id === id);
};

/**
 * Search templates by tags or name
 */
export const searchTemplates = (query: string): PromptTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return getAllTemplates().filter(template => 
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Build enhanced system prompt using template
 */
export const buildSystemPromptWithTemplate = (
  template: PromptTemplate,
  context?: DiagramContext
): string => {
  let systemPrompt = template.systemPrompt;

  // Add context information
  if (context?.currentCode) {
    systemPrompt += `\n\nCURRENT DIAGRAM CONTEXT:
The user has existing ${context.language} code:
\`\`\`${context.language}
${context.currentCode}
\`\`\`

When modifying existing code:
- Preserve the current structure when possible
- Make incremental improvements
- Maintain consistency with existing style`;
  }

  // Add conversation context
  if (context?.previousMessages && context.previousMessages.length > 0) {
    systemPrompt += `\n\nCONVERSATION CONTEXT:
Previous messages in this conversation:
${context.previousMessages.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;
  }

  return systemPrompt;
};

/**
 * Build user prompt using template
 */
export const buildUserPromptWithTemplate = (
  template: PromptTemplate,
  userPrompt: string,
  _context?: DiagramContext
): string => {
  // Replace template placeholders
  let finalPrompt = template.userPromptTemplate.replace('{prompt}', userPrompt);

  // Add examples if helpful
  if (template.examples.length > 0) {
    const relevantExample = template.examples[0]; // Use first example for now
    if (relevantExample) {
      finalPrompt += `\n\nEXAMPLE FOR REFERENCE:
Input: "${relevantExample.input}"
Expected style: ${relevantExample.description}`;
    }
  }

  return finalPrompt;
};

/**
 * Get suggested templates based on user prompt
 */
export const getSuggestedTemplates = (
  userPrompt: string,
  language: 'mermaid' | 'plantuml' | 'graphviz' = 'mermaid'
): PromptTemplate[] => {
  const lowerPrompt = userPrompt.toLowerCase();
  const templates = getTemplatesByLanguage(language);

  // Score templates based on keyword matches
  const scoredTemplates = templates.map(template => {
    let score = 0;
    
    // Check category keywords
    if (lowerPrompt.includes(template.category)) score += 10;
    
    // Check template name
    if (lowerPrompt.includes(template.name.toLowerCase())) score += 8;
    
    // Check tags
    template.tags.forEach(tag => {
      if (lowerPrompt.includes(tag)) score += 5;
    });
    
    // Check description keywords
    const descWords = template.description.toLowerCase().split(' ');
    descWords.forEach(word => {
      if (word.length > 3 && lowerPrompt.includes(word)) score += 2;
    });

    return { template, score };
  });

  // Return top 3 templates sorted by score
  return scoredTemplates
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.template);
};