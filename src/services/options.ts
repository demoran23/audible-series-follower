export interface IOptions {
  audibleBaseUrl: string;
}

export const setOptions = (options: Partial<IOptions>) =>
  chrome.storage.sync.set(options);

export const getOptions = async () => {
  const options = (await chrome.storage.sync.get(null)) as IOptions;

  options.audibleBaseUrl ??= 'https://www.audible.com';

  return options;
};
