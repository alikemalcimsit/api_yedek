import { asyncHandler } from '../../middleware/index.js';
import { BaseController } from '../base/base.controller.js';

export class SettingsController extends BaseController {
    constructor({ settingsService }) {
        super(settingsService);
    }

    getSetting = asyncHandler(async (req, res) => {
        const { name } = req.query;

        if (name) {
            const setting = await this.service.getSettingByName(name);
            res.json({ success: true, setting });
        } else {
            const settings = await this.service.getAllSettings();
            res.json({ success: true, settings });
        }
    });

    // POST /settings (body: { name, value })
    updateSetting = asyncHandler(async (req, res) => {
        const { name, value } = req.body;

        if (!name || typeof value === 'undefined') {
            throw new Error('Geçersiz name veya value');
        }

        const result = await this.service.updateSetting(name, value);
        res.status(result.success ? 200 : 400).json(result);
    });
}