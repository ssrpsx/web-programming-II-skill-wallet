import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Skill Wallet API",
      version: "1.0.0",
      description: "REST API for the Skill Wallet application",
    },
    servers: [{ url: "/api", description: "API base path" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string", enum: ["user", "interviewer"] },
            rank: { type: "string" },
            photo: { type: "string" },
            birthDate: { type: "string", format: "date-time" },
            oauthProvider: { type: "string" },
            isTwoFactorEnabled: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Skill: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        LevelData: {
          type: "object",
          properties: {
            _id: { type: "string" },
            level: { type: "string", enum: ["choice", "p2p_interview", "interview"] },
            status: { type: "string", enum: ["pending", "completed", "failed"] },
            verifiedBy: { type: "string" },
            verifiedAt: { type: "string", format: "date-time" },
            link: { type: "string" },
            choice: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      options: { type: "array", items: { type: "string" } },
                      answer: { type: "string" },
                    },
                  },
                },
                userAnswers: { type: "array", items: { type: "string" } },
                score: { type: "number" },
              },
            },
          },
        },
        Verification: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            skillId: { type: "string" },
            levelData: { type: "array", items: { $ref: "#/components/schemas/LevelData" } },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                _id: { type: "string" },
                email: { type: "string" },
                name: { type: "string" },
              },
            },
          },
        },
      },
    },
    paths: {
      // ── Auth ────────────────────────────────────────────────────────
      "/auth/signup": {
        post: {
          tags: ["Auth"],
          summary: "Create a new account",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password", "name"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                    name: { type: "string", minLength: 2 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User created", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            409: { description: "Email already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/signin": {
        post: {
          tags: ["Auth"],
          summary: "Sign in with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Sign in successful (or 2FA required)",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/AuthResponse" },
                      {
                        type: "object",
                        properties: {
                          requires2FA: { type: "boolean" },
                          tempToken: { type: "string" },
                          message: { type: "string" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current authenticated user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Current user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Logged out", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
          },
        },
      },
      "/auth/2fa/verify": {
        post: {
          tags: ["Auth", "2FA"],
          summary: "Verify 2FA OTP and complete sign-in",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["tempToken", "otp"],
                  properties: {
                    tempToken: { type: "string" },
                    otp: { type: "string", minLength: 6, maxLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "2FA verified", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            401: { description: "Invalid or expired OTP", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/2fa/enable": {
        post: {
          tags: ["Auth", "2FA"],
          summary: "Send OTP to enable 2FA (step 1)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "OTP sent to email", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
          },
        },
      },
      "/auth/2fa/confirm": {
        post: {
          tags: ["Auth", "2FA"],
          summary: "Confirm OTP to activate 2FA (step 2)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["otp"],
                  properties: { otp: { type: "string", minLength: 6, maxLength: 6 } },
                },
              },
            },
          },
          responses: {
            200: { description: "2FA enabled", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
            401: { description: "Invalid or expired OTP", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/google": {
        get: {
          tags: ["Auth", "OAuth"],
          summary: "Redirect to Google consent screen",
          responses: {
            302: { description: "Redirects to Google OAuth" },
          },
        },
      },
      "/auth/google/callback": {
        get: {
          tags: ["Auth", "OAuth"],
          summary: "Google OAuth callback (handled by Google)",
          parameters: [{ name: "code", in: "query", required: true, schema: { type: "string" } }],
          responses: {
            302: { description: "Redirects to frontend with JWT token" },
          },
        },
      },
      // ── Users ───────────────────────────────────────────────────────
      "/users": {
        get: {
          tags: ["Users"],
          summary: "Get all users",
          responses: {
            200: { description: "List of users", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/User" } } } } },
          },
        },
      },
      "/users/{id}": {
        get: {
          tags: ["Users"],
          summary: "Get user by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "User found", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
            404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        patch: {
          tags: ["Users"],
          summary: "Update user",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    photo: { type: "string" },
                    birthDate: { type: "string", format: "date" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "User updated", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
            404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Users"],
          summary: "Delete user",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "User deleted", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
            404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      // ── Skills ──────────────────────────────────────────────────────
      "/skills": {
        get: {
          tags: ["Skills"],
          summary: "Get all skills",
          responses: {
            200: { description: "List of skills", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Skill" } } } } },
          },
        },
        post: {
          tags: ["Skills"],
          summary: "Create a skill (interviewer only)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "category"],
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    category: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Skill created", content: { "application/json": { schema: { $ref: "#/components/schemas/Skill" } } } },
            403: { description: "Insufficient role", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/skills/category/{category}": {
        get: {
          tags: ["Skills"],
          summary: "Get skills by category",
          parameters: [{ name: "category", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Skills in category", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Skill" } } } } },
          },
        },
      },
      "/skills/{id}": {
        get: {
          tags: ["Skills"],
          summary: "Get skill by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Skill found", content: { "application/json": { schema: { $ref: "#/components/schemas/Skill" } } } },
            404: { description: "Skill not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        patch: {
          tags: ["Skills"],
          summary: "Update skill (interviewer only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    category: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Skill updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Skill" } } } },
            404: { description: "Skill not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Skills"],
          summary: "Delete skill (interviewer only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Skill deleted", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
            404: { description: "Skill not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      // ── Verifications ───────────────────────────────────────────────
      "/verifications": {
        get: {
          tags: ["Verifications"],
          summary: "Get all verifications (authenticated)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "List of verifications", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Verification" } } } } },
          },
        },
        post: {
          tags: ["Verifications"],
          summary: "Create a verification request",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["userId"],
                  properties: {
                    userId: { type: "string" },
                    skillId: { type: "string" },
                    skillTitle: { type: "string" },
                    levelData: { type: "array", items: { $ref: "#/components/schemas/LevelData" } },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Verification created", content: { "application/json": { schema: { $ref: "#/components/schemas/Verification" } } } },
          },
        },
      },
      "/verifications/{id}": {
        get: {
          tags: ["Verifications"],
          summary: "Get verification by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Verification found", content: { "application/json": { schema: { $ref: "#/components/schemas/Verification" } } } },
            404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        patch: {
          tags: ["Verifications"],
          summary: "Update verification (interviewer only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    levelData: { type: "array", items: { $ref: "#/components/schemas/LevelData" } },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Verification updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Verification" } } } },
          },
        },
        delete: {
          tags: ["Verifications"],
          summary: "Delete verification (interviewer only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Deleted", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
          },
        },
      },
      "/verifications/{id}/submit": {
        post: {
          tags: ["Verifications"],
          summary: "Submit multiple-choice answers",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["answers"],
                  properties: {
                    answers: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Answers submitted", content: { "application/json": { schema: { $ref: "#/components/schemas/Verification" } } } },
          },
        },
      },
      "/verifications/{id}/p2p/initiate": {
        post: {
          tags: ["Verifications"],
          summary: "Initiate peer-to-peer interview level",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "P2P initiated", content: { "application/json": { schema: { $ref: "#/components/schemas/Verification" } } } },
          },
        },
      },
      "/verifications/{id}/interview/initiate": {
        post: {
          tags: ["Verifications"],
          summary: "Initiate formal interview level",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Interview initiated", content: { "application/json": { schema: { $ref: "#/components/schemas/Verification" } } } },
          },
        },
      },
      "/verifications/{id}/retry": {
        post: {
          tags: ["Verifications"],
          summary: "Retry the multiple-choice level",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Choice level reset", content: { "application/json": { schema: { $ref: "#/components/schemas/Verification" } } } },
          },
        },
      },
      "/verifications/{id}/levels/{level}/complete": {
        patch: {
          tags: ["Verifications"],
          summary: "Mark a level complete/failed (interviewer only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
            { name: "level", in: "path", required: true, schema: { type: "string", enum: ["choice", "p2p_interview", "interview"] } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", enum: ["completed", "failed"] },
                    verifiedBy: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Level updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Verification" } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
