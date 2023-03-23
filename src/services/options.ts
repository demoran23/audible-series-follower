export interface IOptions {
  stub: string;
}

export const setOptions = (options: Partial<IOptions>) =>
  chrome.storage.sync.set(options);

export const getOptions = async () =>
  chrome.storage.sync.get(null) as Promise<IOptions>;
