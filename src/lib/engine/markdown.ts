const allowedTags = new Set([
	'a',
	'blockquote',
	'br',
	'code',
	'em',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'hr',
	'li',
	'ol',
	'p',
	'pre',
	'strong',
	'ul'
]);

const dangerousTags = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'template']);

function isSafeHref(value: string) {
	try {
		const url = new URL(value, window.location.origin);
		return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
	} catch {
		return false;
	}
}

function unwrapElement(element: Element) {
	const parent = element.parentNode;
	if (!parent) return;
	while (element.firstChild) parent.insertBefore(element.firstChild, element);
	parent.removeChild(element);
}

function cleanAttributes(element: Element) {
	for (const attr of [...element.attributes]) {
		const name = attr.name.toLowerCase();
		if (element.tagName.toLowerCase() === 'a' && (name === 'href' || name === 'title')) {
			if (name === 'href' && !isSafeHref(attr.value)) element.removeAttribute(attr.name);
			continue;
		}
		element.removeAttribute(attr.name);
	}

	if (element.tagName.toLowerCase() === 'a' && element.hasAttribute('href')) {
		element.setAttribute('rel', 'noopener noreferrer');
	}
}

function sanitizeChildren(root: ParentNode) {
	for (const child of [...root.children]) {
		const tagName = child.tagName.toLowerCase();
		if (dangerousTags.has(tagName)) {
			child.remove();
			continue;
		}
		if (!allowedTags.has(tagName)) {
			sanitizeChildren(child);
			unwrapElement(child);
			continue;
		}
		cleanAttributes(child);
		sanitizeChildren(child);
	}
}

export function sanitizeMarkdownHtml(html: string) {
	const document = new DOMParser().parseFromString(html, 'text/html');
	sanitizeChildren(document.body);
	return document.body.innerHTML;
}
