// src/controllers/usernotes.controller.js

import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class UserSystemController extends BaseController {
    constructor({ userSystemService }) {
        super(userSystemService);
    }

    // GET /usersystem (gövdede userPatientId, userSystemId)
    list = asyncHandler(async (req, res) => {
        const result = await this.service.getAllUserSystem(req.query, req);
        res.json({ success: true, data: result });
    });

    // POST /usersystem (gövdede userPatientId, userSystemId)
    create = asyncHandler(async (req, res) => {
        const result = await this.service.createUserSystem(req.body, req);
        res.status(201).json({ success: true, data: result });
    });

    // GET /usersystem?userSystemId=1336
    getUserSystemById = asyncHandler(async (req, res) => {
        const userSystemId = Number(req.query.userSystemId);
        if (!userPatientId) throw new Error('Geçersiz userSystemId');

        const result = await this.service.getUserSystemById(userSystemId);
        res.json({ success: true, data: result });
    });


    // PUT /usersystem/:id (admin güncelle)
    updateWithValidation = asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const result = await this.service.updateUserSystem(id, req.body, req);
        res.json({ success: true, data: result });
    });

    // DELETE /usersystem/:id (admin sil)
    deleteUserSystem = asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const result = await this.service.deleteUserSystem(id, req);
        res.json({ success: true, ...result });
    });

    // GET /usersystem/profile (admin profil bilgilerini getirir)
    profile = asyncHandler(async (req, res) => {
        const result = await this.service.getUserSystemProfile(req.user.id, req);
        res.json({ success: true, data: result });
    });
}

/**import { asyncHandler } from '../../middleware/index.js';
import { getAllUserSystem, getUserSystemById } from './userSystem.service.js';



 * Tüm kullanıcıları listeler (sayfalama ile)
 * @param {Object} req - Express request objesi
 * @param {Object} res - Express response objesi
 * @param {Function} next - Express next middleware fonksiyonu
 *
const userSystemList = asyncHandler(async (req, res, next) => {
    try {
        //req.query.page = 1;
        //req.query.limit = 10;
        //req.query.search = 'admin';
        //req.query.sort = 'createdAt';
        //req.query.order = 'desc';
 
        const result = await getAllUserSystem(req.query);

        res.status(200).json({
            success: true,
            message: 'Kullanıcılar başarıyla getirildi',
            admins: result.users,
            pagination: result.pagination
        });

    } catch (error) {
        console.error('UserSystemController - userSystemList hatası:', error);
        next(error);
    }
});

/**
 * Kullanıcı profil bilgilerini getirir
 * @param {Object} req - Express request objesi
 * @param {Object} res - Express response objesi
 * @param {Function} next - Express next middleware fonksiyonu
 *
const userSystemProfile = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await getUserSystemById(id);

        res.status(200).json({
            success: true,
            message: 'Profil başarıyla getirildi',
            data: user
        });

    } catch (error) {
        console.error('UserSystemController - userSystemProfile hatası:', error);
        next(error);
    }
});

export {
    userSystemList,
    userSystemProfile
};*/