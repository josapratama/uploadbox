import { FastifyInstance } from "fastify";
import { config, getCdnBaseUrl } from "../config";

export async function widgetRoutes(app: FastifyInstance) {
  // Serve the embeddable upload widget JS
  app.get("/widget.js", async (request, reply) => {
    const apiBase = getCdnBaseUrl(request).replace(/\/cdn$/, "");
    const script = `
(function() {
  'use strict';

  var UPLOADBOX_API = '${apiBase}';

  function UploadBox(options) {
    this.publicKey = options.publicKey;
    this.onUpload = options.onUpload || function() {};
    this.onError = options.onError || function() {};
    this.maxSize = options.maxSize || 5368709120;
    this.accept = options.accept || '*/*';
  }

  UploadBox.prototype.upload = function(file) {
    var self = this;
    var formData = new FormData();
    formData.append('file', file);

    return fetch(UPLOADBOX_API + '/api/upload/file', {
      method: 'POST',
      headers: { 'X-UploadBox-Public-Key': self.publicKey },
      body: formData
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.error) throw new Error(data.error);
      self.onUpload(data);
      return data;
    })
    .catch(function(err) {
      self.onError(err);
      throw err;
    });
  };

  UploadBox.prototype.createWidget = function(container) {
    var self = this;
    var el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;

    var widget = document.createElement('div');
    widget.style.cssText = 'border:2px dashed #e2e8f0;border-radius:12px;padding:32px;text-align:center;cursor:pointer;transition:all 0.2s;';
    widget.innerHTML = '<p style="margin:0;color:#64748b;font-size:14px;">Click or drag files to upload</p>';

    var input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = self.accept;
    input.style.display = 'none';

    widget.addEventListener('click', function() { input.click(); });
    widget.addEventListener('dragover', function(e) { e.preventDefault(); widget.style.borderColor = '#6366f1'; });
    widget.addEventListener('dragleave', function() { widget.style.borderColor = '#e2e8f0'; });
    widget.addEventListener('drop', function(e) {
      e.preventDefault();
      widget.style.borderColor = '#e2e8f0';
      Array.from(e.dataTransfer.files).forEach(function(f) { self.upload(f); });
    });

    input.addEventListener('change', function() {
      Array.from(input.files).forEach(function(f) { self.upload(f); });
      input.value = '';
    });

    el.appendChild(widget);
    el.appendChild(input);
    return widget;
  };

  window.UploadBox = UploadBox;
})();
`;

    reply.header("Content-Type", "application/javascript");
    reply.header("Cache-Control", "public, max-age=3600");
    reply.header("Access-Control-Allow-Origin", "*");
    return reply.send(script);
  });

  // Widget documentation endpoint
  app.get("/widget/docs", async (request, reply) => {
    const apiBase = getCdnBaseUrl(request).replace(/\/cdn$/, "");
    return reply.send({
      usage: `
<!-- Add to your HTML -->
<script src="${apiBase}/api/widget.js"></script>
<div id="upload-widget"></div>
<script>
  var uploader = new UploadBox({
    publicKey: 'YOUR_PUBLIC_KEY',
    onUpload: function(file) { console.log('Uploaded:', file); },
    onError: function(err) { console.error('Error:', err); }
  });
  uploader.createWidget('#upload-widget');
</script>
      `.trim(),
    });
  });
}
