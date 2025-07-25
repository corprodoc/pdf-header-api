import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fetch from 'node-fetch'

export default {
  async fetch(request, env, ctx) {
    try {
      const { searchParams } = new URL(request.url)
      const url = searchParams.get('url')
      const headerText = searchParams.get('header') || ''

      if (!url) {
        return new Response('Missing "url" parameter', { status: 400 })
      }

      const pdfBytes = await fetch(url).then(res => res.arrayBuffer())
      const pdfDoc = await PDFDocument.load(pdfBytes)

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const pages = pdfDoc.getPages()

      for (const page of pages) {
        const { width, height } = page.getSize()
        page.drawText(headerText, {
          x: width - textWidth - 20,
          y: height - 50,
          size: 7,
          font,
          color: rgb(0, 0, 0)
        })
      }

      const newPdfBytes = await pdfDoc.save()
      return new Response(newPdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="header.pdf"'
        }
      })
    } catch (e) {
      return new Response('Error: ' + e.message, { status: 500 })
    }
  }
}
