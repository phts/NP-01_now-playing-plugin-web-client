import React, { createContext, useContext, useRef } from 'react';
import { useAppContext } from './AppContextProvider';
import { useToasts } from './NotificationProvider';

export type LoadedFont = { family: string; face: FontFace; url: string; };

export interface FontContextValue {
  loadFont(family: string, file: string): Promise<boolean>;
  getLoadedFonts(): LoadedFont[];
}

const FontContext = createContext({} as FontContextValue);

const FontContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { pluginInfo } = useAppContext();
  const { appUrl = null } = pluginInfo || {};
  const showToast = useToasts();
  const loadedFonts = useRef<Record<string, LoadedFont>>({});

  const loadFont = async (family: string, file: string | null) => {
    const url = appUrl && file ? `${appUrl}/font/${file}` : null;
    const existing = loadedFonts.current[family];
    let hasChanged = false;
    if (existing) {
      if (url && existing.url === url) {
        return false; // No change
      }
      delete loadedFonts.current[family];
      document.fonts.delete(existing.face);
      hasChanged = true;
    }
    if (!url) {
      return hasChanged;
    }
    try {
      const fontFace = new FontFace(family, `url("${url}")`);
      const loaded = await fontFace.load();
      document.fonts.add(loaded);
      loadedFonts.current[family] = { family, face: loaded, url };
      hasChanged = true;
    }
    catch (error) {
      const message = `Failed to load font from "${url}": ${error instanceof Error ? error.message : error}`;
      showToast({
        type: 'error',
        message
      });
      console.error(message);
    }
    return hasChanged;
  };

  const getLoadedFonts = () => Object.values(loadedFonts.current);

  return (
    <FontContext.Provider
      value={{ loadFont, getLoadedFonts }}>
      {children}
    </FontContext.Provider>
  );
};

const useFonts = () => useContext(FontContext);

export { useFonts, FontContextProvider };
