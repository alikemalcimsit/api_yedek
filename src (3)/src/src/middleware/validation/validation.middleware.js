import Joi from 'joi';

/**
 * Generic validation middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

/**
 * User System validasyonları
 */
const userSystemSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'İsim en az 2 karakter olmalı',
      'string.max': 'İsim en fazla 100 karakter olabilir',
      'any.required': 'İsim zorunludur'
    }),
    username: Joi.string().min(3).max(50).required().messages({
      'string.min': 'Kullanıcı adı en az 3 karakter olmalı',
      'any.required': 'Kullanıcı adı zorunludur'
    }),
    phoneNumber: Joi.string().pattern(/^[0-9+\-\s()]+$/).messages({
      'string.pattern.base': 'Geçerli bir telefon numarası girin'
    }),
    role: Joi.string().valid('2', '1', '0').required().messages({
      'any.only': 'Rol 0,1 veya 2 olmalı',
      'any.required': 'Rol zorunludur'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Şifre en az 6 karakter olmalı',
      'any.required': 'Şifre zorunludur'
    })
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    username: Joi.string().min(3).max(50).optional(),
    phoneNumber: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    role: Joi.string().valid('admin', 'user', 'moderator').optional(),
    password: Joi.string().min(6).optional()
  })
};

/**
 * Chat message validasyonu
 */
const chatMessageSchema = Joi.object({
  chatData: Joi.object({
    adminId: Joi.number().integer().required(),
    userPatientId: Joi.number().integer().required(),
    text: Joi.string().max(1000).required(),
    chatType: Joi.string().required(),
    messageId: Joi.string().required()
  }).required()
});

/**
 * Login validasyonu
 */
const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.min': 'Kullanıcı adı en az 3 karakter olmalı',
    'string.max': 'Kullanıcı adı en fazla 50 karakter olabilir',
    'any.required': 'Kullanıcı adı zorunludur'
  }),
  password: Joi.string().min(1).required().messages({
    'string.min': 'Şifre boş olamaz',
    'any.required': 'Şifre zorunludur'
  })
});

/**
 * Şifre güncelleme validasyonu
 */
const updatePasswordSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.min': 'Kullanıcı adı en az 3 karakter olmalı',
    'string.max': 'Kullanıcı adı en fazla 50 karakter olabilir',
    'any.required': 'Kullanıcı adı zorunludur'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Yeni şifre en az 6 karakter olmalı',
    'any.required': 'Yeni şifre zorunludur'
  })
});

/**
 * Specific validation middlewares
 */
const validateUserCreate = validate(userSystemSchemas.create);
const validateUserUpdate = validate(userSystemSchemas.update);
const validateChatMessage = validate(chatMessageSchema);
const validateLoginInput = validate(loginSchema);
const validateUpdatePassword = validate(updatePasswordSchema);

/**
 * ID parameter validasyonu
 */
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      message: 'Geçerli bir ID girin'
    });
  }
  
  next();
};

export {
  validate,
  validateUserCreate,
  validateUserUpdate,
  validateChatMessage,
  validateLoginInput,
  validateUpdatePassword,
  validateId,
  userSystemSchemas
};