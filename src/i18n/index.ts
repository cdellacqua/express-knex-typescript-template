import en from './translation/en';
import config from '../config';

const translations: Record<string, Record<string, string>> = {
	en,
};

export type i18nTranslate = (text: string, replace?: Record<string, any>, locale?: string) => string

export function translate(text: string, replace: Record<string, any> = {}, locale?: string): string {
	let result = (translations[
		locale || config.product.locale]?.[text] ?? text);
	Object.keys(replace)
		.sort((k1, k2) => -(k1.length - k2.length))
		.forEach((key) => {
			result = result
				.replace(new RegExp(`([^\\\\]):${key}`, 'g'), `$1${replace[key]}`)
				.replace(new RegExp(`^:${key}`, 'g'), `${replace[key]}`);
		});
	result = result.replace(/\\:/g, ':');

	return result;
}

export function getDecimalSeparator(langs?: string[]): string {
	return Number(0.1).toLocaleString(langs).replace(/\d/g, '');
}

export function getTranslator(langs?: string[]): ((text: string, replace?: Record<string, any>) => string) {
	const translationKeys = Object.keys(translations);
	const exactLocale = langs
		?.find((l) => translationKeys.includes(l));
	const localeWithoutTerritory = langs
		?.map((l) => l.substring(0, 2))
		.find((l) => translationKeys.includes(l));

	return (text: string, replace: Record<string, any> = {}): string => translate(
		text,
		replace,
		exactLocale || localeWithoutTerritory || config.product.locale,
	);
}
