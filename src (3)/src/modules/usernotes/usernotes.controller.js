// src/controllers/usernotes.controller.js

import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class UsernotesController extends BaseController {
  constructor({ usernotesService }) {
    super(usernotesService);
  }

  // POST /user-notes (gövdede userPatientId, userSystemId, notes)
  createWithValidation = asyncHandler(async (req, res) => {
    const note = await this.service.createWithValidation(req.body);
    res.status(201).json({ success: true, data: note });
  });

  // GET /user-notes?userPatientId=1336
  getNotesByUserPatientId = asyncHandler(async (req, res) => {
    const userPatientId = Number(req.query.userPatientId);
    if (!userPatientId) throw new Error('Geçersiz userPatientId');

    const notes = await this.service.getNotesByUserPatientId(userPatientId);
    res.json({ success: true, data: notes });
  });

  // POST /user-notes/by-user (body içinde userSystemId)
  getNotesByUserSystemId = asyncHandler(async (req, res) => {
    const { userSystemId } = req.body;
    if (!userSystemId) throw new Error('Geçersiz userSystemId');

    const notes = await this.service.getNotesByUserSystemId(Number(userSystemId));
    res.json({ success: true, data: notes });
  });

  // PUT /user-notes/:id (notu güncelle)
  updateWithValidation = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const updated = await this.service.updateWithValidation(id, req.body);
    res.json({ success: true, data: updated });
  });

  // DELETE /user-notes/:id (notu sil)
  deleteNote = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const result = await this.service.deleteNote(id);
    res.json({ success: true, ...result });
  });
}
