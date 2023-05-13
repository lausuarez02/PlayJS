import { encode } from 'js-base64'

export function updateURL (code) {
  const hashedCode = `${encode(code)}`
  window.history.replaceState(null, null, `/${hashedCode}`)
}
export function getResult (code) {
  if (!code) {
    return ''
  }

  let result = ''
  let prevResult = ''
  const codeLines = code.trimEnd().split(/\r?\n|\r|\n/g)

  for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i].trim()
    if (line === '') {
      result += '\n'
      continue
    }

    const lineCode = codeLines.slice(0, i + 1).join('\n')
    if (line.startsWith('//') || line.startsWith('/*')) {
      result += '\n'
      continue
    }

    try {
      // eslint-disable-next-line no-eval
      const html = eval(lineCode)
      if (i > 0 && line !== codeLines[i - 1].trim() && prevResult === html) {
        result += '\n'
      } else {
        result += parseResultHTML(html) + '\n'
      }
      prevResult = html
    } catch (err) {
      if (err instanceof ReferenceError) {
        result += err
      }
      result += '\n'
    }
  }

  return result
}

window.console.log = function (...data) {
  return parseResultHTML(...data)
}

export function parseResultHTML (html) {
  if (typeof html === 'object') {
    return JSON.stringify(html)
  }
  if (typeof html === 'string') {
    // start o end with ' or "
    if (html.match(/^['"].*['"]$/)) return html
    return `'${html}'`
  }
  if (typeof html === 'function') {
    return html()
  }
  if (typeof html === 'symbol') {
    return html.toString()
  }
  if (typeof html === 'undefined') {
    return ''
  }
  return html
}