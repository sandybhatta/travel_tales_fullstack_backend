import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travel Tales API Documentation',
      version: '1.0.0',
      description: 'Complete API documentation for the Travel Tales backend. This API manages users, trips, posts, comments, and more.',
      contact: {
        name: 'Backend Support',
        email: 'support@traveltales.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
      {
        url: 'https://api.traveltalesapp.in',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http', 
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
            name: { type: 'string', example: 'Sandip Bhattacharjee' },
            username: { type: 'string', example: 'sandy_dev' },
            email: { type: 'string', format: 'email', example: 'sandy@example.com' },
            password: { type: 'string', format: 'password', example: 'hashed_password_string' },
            avatar: {
              type: 'object',
              properties: {
                public_id: { type: 'string', example: 'avatar_123' },
                url: { type: 'string', example: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }
              }
            },
            bio: { type: 'string', example: 'Travel enthusiast.' },
            location: {
              type: 'object',
              properties: {
                city: { type: 'string', example: 'Melaghar' },
                state: { type: 'string', example: 'Tripura' },
                country: { type: 'string', example: 'India' }
              }
            },
            role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
            followers: { type: 'array', items: { type: 'string', description: 'User ID' } },
            following: { type: 'array', items: { type: 'string', description: 'User ID' } },
            closeFriends: { type: 'array', items: { type: 'string', description: 'User ID' } },
            bookmarks: { type: 'array', items: { type: 'string', description: 'Post ID' } },
            badges: { type: 'array', items: { type: 'string', example: 'city_hopper' } },
            xp: { type: 'number', default: 0 },
            level: { type: 'number', default: 1 },
            lastLogin: { type: 'string', format: 'date-time' },
            isVerified: { type: 'boolean', default: false },
            isBanned: { type: 'boolean', default: false },
            isDeactivated: { type: 'boolean', default: false },
            deactivationReason: { type: 'string' },
            deactivatedDate: { type: 'string', format: 'date-time' },
            privacy: {
              type: 'object',
              properties: {
                profileVisibility: { type: 'string', enum: ['public', 'followers', 'private', 'close_friends'], default: 'public' },
                allowComments: { type: 'string', enum: ['everyone', 'followers', 'close_friends', 'no_one'], default: 'everyone' }
              }
            },
            blockedUsers: { type: 'array', items: { type: 'string', description: 'User ID' } },
            interests: { 
              type: 'array', 
              items: { type: 'string', enum: ['adventure', 'beach', 'mountains', 'history', 'food', 'wildlife', 'culture', 'luxury', 'budget', 'road_trip', 'solo', 'group', 'trekking', 'spiritual', 'nature', 'photography', 'festivals', 'architecture', 'offbeat', 'shopping'] } 
            },
            resgistersAt: { type: 'string', format: 'date-time' },
            usernameChangedAt: { type: 'string', format: 'date-time' },
            pendingEmail: { type: 'string' },
            emailVerifyToken: { type: 'string' },
            emailVerifyTokenExpires: { type: 'string', format: 'date-time' }
          }
        },
        Trip: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d0fe4f5311236168a109cb' },
            user: { type: 'string', description: 'User ID of owner', example: '60d0fe4f5311236168a109ca' },
            title: { type: 'string', example: 'Summer in Paris' },
            description: { type: 'string', example: 'A wonderful trip to France.' },
            coverPhoto: {
               type: 'object',
               properties: {
                 public_id: { type: 'string' },
                 url: { type: 'string' }
               }
            },
            startDate: { type: 'string', format: 'date', example: '2024-06-01' },
            endDate: { type: 'string', format: 'date', example: '2024-06-10' },
            destinations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  city: { type: 'string' },
                  state: { type: 'string' },
                  country: { type: 'string' }
                }
              }
            },
            visibility: { type: 'string', enum: ['public', 'private', 'followers', 'close_friends'], example: 'public' },
            isArchived: { type: 'boolean', default: false },
            isCompleted: { type: 'boolean', default: false },
            tags: { 
              type: 'array', 
              items: { type: 'string', enum: ['adventure', 'beach', 'mountains', 'history', 'food', 'wildlife', 'culture', 'luxury', 'budget', 'road_trip', 'solo', 'group', 'trekking', 'spiritual', 'nature', 'photography', 'festivals', 'architecture', 'offbeat', 'shopping'] } 
            },
            travelBudget: { type: 'number', default: 0 },
            expenses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  amount: { type: 'number' },
                  spentBy: { type: 'string', description: 'User ID' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            notes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  body: { type: 'string' },
                  createdBy: { type: 'string', description: 'User ID' },
                  isPinned: { type: 'boolean', default: false },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            todoList: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  task: { type: 'string' },
                  done: { type: 'boolean', default: false },
                  dueDate: { type: 'string', format: 'date-time' },
                  createdBy: { type: 'string', description: 'User ID' },
                  assignedTo: { type: 'string', description: 'User ID' }
                }
              }
            },
            posts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  post: { type: 'string', description: 'Post ID' },
                  dayNumber: { type: 'number' },
                  isHighlighted: { type: 'boolean', default: false },
                  highlightedBy: { type: 'string', description: 'User ID' },
                  addedAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            likes: { type: 'array', items: { type: 'string', description: 'User ID' } },
            invitedFriends: { type: 'array', items: { type: 'string', description: 'User ID' } },
            acceptedFriends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: { type: 'string', description: 'User ID' },
                  acceptedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d0fe4f5311236168a109cc' },
            author: { type: 'string', description: 'User ID', example: '60d0fe4f5311236168a109ca' },
            caption: { type: 'string', example: 'Enjoying the view!' },
            media: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string', example: 'https://example.com/image.jpg' },
                  public_id: { type: 'string', example: 'image_123' },
                  resource_type: { type: 'string', enum: ['image', 'video'], default: 'image' }
                }
              }
            },
            likes: { type: 'array', items: { type: 'string', description: 'User ID' } },
            comments: { type: 'array', items: { type: 'string', description: 'Comment ID' } },
            visibility: { type: 'string', enum: ['public', 'followers', 'close_friends', 'private'], default: 'public' },
            location: {
              type: 'object',
              properties: {
                city: { type: 'string' },
                state: { type: 'string' },
                country: { type: 'string' }
              }
            },
            taggedUsers: { type: 'array', items: { type: 'string', description: 'User ID' } },
            hashtags: { type: 'array', items: { type: 'string' } },
            sharedFrom: { type: 'string', description: 'Original Post ID if shared' },
            bookmarkedBy: { type: 'array', items: { type: 'string', description: 'User ID' } },
            tripId: { type: 'string', description: 'Trip ID' },
            travelDate: { type: 'string', format: 'date-time' },
            mentions: { type: 'array', items: { type: 'string', description: 'User ID' } },
            isFeatured: { type: 'boolean', default: false }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d0fe4f5311236168a109cd' },
            post: { type: 'string', description: 'Post ID', example: '60d0fe4f5311236168a109cc' },
            author: { type: 'string', description: 'User ID', example: '60d0fe4f5311236168a109ca' },
            content: { type: 'string', example: 'Great photo!' },
            likes: { type: 'array', items: { type: 'string', description: 'User ID' } },
            parentComment: { type: 'string', description: 'Parent Comment ID', nullable: true },
            rootComment: { type: 'string', description: 'Root Comment ID', nullable: true },
            mentions: { type: 'array', items: { type: 'string', description: 'User ID' } },
            isDeleted: { type: 'boolean', default: false }
          }
        },
        Otp: {
          type: 'object',
          properties: {
            user: { type: 'string', description: 'User ID', example: '60d0fe4f5311236168a109ca' },
            otp: { type: 'string', description: 'Hashed OTP' },
            type: { type: 'string', enum: ['login', 'reset_password'] },
            expiresAt: { type: 'string', format: 'date-time' }
          }
        },
        SearchHistory: {
          type: 'object',
          properties: {
            user: { type: 'string', description: 'User ID', example: '60d0fe4f5311236168a109ca' },
            query: { type: 'string', example: 'Paris' },
            type: { type: 'string', enum: ['user', 'post', 'trip', 'general'], default: 'general' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Token: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'User ID' },
            token: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
