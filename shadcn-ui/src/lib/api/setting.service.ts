import apiClient from "./api-client";

export interface SystemSetting {
  group: string;
  key: string;
  payload: any;
  type?: string;
}

class SettingService {
  /**
   * Get all settings or settings by group
   */
  async getSettings(group?: string) {
    const url = group ? `/settings?group=${group}` : "/settings";
    const response = await apiClient.get(url);
    return response.data.data;
  }

  /**
   * Update settings for a specific group
   */
  async updateSettings(group: string, payload: Record<string, any>) {
    const response = await apiClient.post(`/settings/${group}`, payload);
    return response.data;
  }
}

export const settingService = new SettingService();
export default settingService;
