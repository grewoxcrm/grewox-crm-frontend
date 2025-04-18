import React, { useEffect } from 'react';
import { useGetAllSettingsQuery } from '../superadmin/module/settings/general/services/settingApi';
import { applySiteSettings } from '../utils/siteSettings';

/**
 * Component to initialize site settings when the app loads
 * This component doesn't render anything, it just applies the settings
 */
const SiteSettingsInitializer = () => {
  const { data: settingsData } = useGetAllSettingsQuery();

  useEffect(() => {
    if (settingsData?.success && settingsData?.data && settingsData.data.length > 0) {
      const settings = settingsData.data[0];
      
      // Apply site settings
      applySiteSettings({
        favicon: settings.favicon,
        title: settings.title,
        companyName: settings.companyName
      });
    }
  }, [settingsData]);

  // This component doesn't render anything
  return null;
};

export default SiteSettingsInitializer; 