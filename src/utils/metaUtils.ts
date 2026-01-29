type MetaKey =
  | { kind: 'name'; key: string }
  | { kind: 'property'; key: string }

function upsertMetaTag(meta: MetaKey, content: string) {
  const selector =
    meta.kind === 'name'
      ? `meta[name="${CSS.escape(meta.key)}"]`
      : `meta[property="${CSS.escape(meta.key)}"]`

  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    if (meta.kind === 'name') el.setAttribute('name', meta.key)
    else el.setAttribute('property', meta.key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function setDocumentTitleAndMeta(input: { title: string; description?: string }) {
  document.title = input.title

  if (input.description) {
    upsertMetaTag({ kind: 'name', key: 'description' }, input.description)
    upsertMetaTag({ kind: 'property', key: 'og:title' }, input.title)
    upsertMetaTag({ kind: 'property', key: 'og:description' }, input.description)
    upsertMetaTag({ kind: 'property', key: 'og:type' }, 'website')
    upsertMetaTag({ kind: 'property', key: 'og:url' }, window.location.href)
    upsertMetaTag({ kind: 'name', key: 'twitter:title' }, input.title)
    upsertMetaTag({ kind: 'name', key: 'twitter:description' }, input.description)
  } else {
    upsertMetaTag({ kind: 'property', key: 'og:title' }, input.title)
    upsertMetaTag({ kind: 'name', key: 'twitter:title' }, input.title)
    upsertMetaTag({ kind: 'property', key: 'og:url' }, window.location.href)
  }
}

