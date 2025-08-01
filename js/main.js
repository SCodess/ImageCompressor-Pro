$(document).ready(function () {
  let e = [],
    s = [],
    i = [];
  const t = $("#upload-area"),
    a = $("#file-input"),
    n = $("#select-btn"),
    o = $("#compress-btn"),
    r = $("#reset-btn"),
    l = $("#download-all"),
    d = $("#progress-container"),
    c = $("#progress-bar"),
    m = $("#progress-text"),
    p = $("#results-container"),
    g = $("#results-grid"),
    h = $("#file-list"),
    f = $("#file-names"),
    u = $("#single-preview"),
    v = $("#original-preview"),
    w = $("#compressed-preview"),
    b = $("#compression-stats"),
    C = $("#hamburger"),
    x = $("#nav-links"),
    z = $("#format"),
    y = $("#quality"),
    F = $("#resize");
  function U() {
    if (!a[0].files.length) return;
    e = Array.from(a[0].files).slice(0, 20);
    e.filter((e) => "png" === k(e.name)).length &&
      (function (e) {
        const s = $("<div>").addClass("toast-message").text(e).appendTo("body");
        setTimeout(() => s.remove(), 4e3);
      })(
        "Note: PNG files may not compress well. Convert to WebP for better results."
      ),
      h.show(),
      f.html(""),
      e.forEach((e) => {
        $("<div>")
          .addClass("file-item")
          .text(`${e.name} (${R(e.size)})`)
          .appendTo(f);
      }),
      (function (e) {
        const s = new FileReader();
        (s.onload = (s) => {
          v.html(`<img src="${s.target.result}">`),
            $("#original-size").text(R(e.size)),
            $("#original-format").text(k(e.name).toUpperCase()),
            (function (e, s) {
              const i = new Image();
              (i.onload = () => s(i.width, i.height)), (i.src = e);
            })(s.target.result, (e, s) =>
              $("#original-dimensions").text(`${e}×${s}`)
            ),
            w.html('<i class="fas fa-image"></i>'),
            $(
              "#compressed-size, #compressed-dimensions, #compressed-format"
            ).text("-"),
            b.text("Upload images to see compression results");
        }),
          s.readAsDataURL(e);
      })(e[0]),
      o.prop("disabled", !1),
      p.hide(),
      u.css("display", "grid");
  }
  function R(e) {
    if (0 === e) return "0 Bytes";
    const s = Math.floor(Math.log(e) / Math.log(1024));
    return (
      parseFloat((e / Math.pow(1024, s)).toFixed(2)) +
      " " +
      ["Bytes", "KB", "MB"][s]
    );
  }
  function k(e) {
    return e.slice(2 + ((e.lastIndexOf(".") - 1) >>> 0)).toLowerCase();
  }
  o.prop("disabled", !0),
    l.hide(),
    p.hide(),
    h.hide(),
    n.on("click", () => a.click()),
    a.on("change", U),
    t
      .on("dragover", function (e) {
        e.preventDefault(), $(this).addClass("dragover");
      })
      .on("dragleave", function () {
        $(this).removeClass("dragover");
      })
      .on("drop", function (e) {
        e.preventDefault(),
          $(this).removeClass("dragover"),
          e.originalEvent.dataTransfer.files.length &&
            ((a[0].files = e.originalEvent.dataTransfer.files), U());
      }),
    o.on("click", function () {
      if (!e.length) return;
      (s = []),
        (i = []),
        g.html(""),
        d.show(),
        c.css("width", "0%"),
        m.text("0%"),
        o
          .prop("disabled", !0)
          .html('<i class="fas fa-spinner spinner"></i> Compressing...');
      const t = e.length;
      let a = 0;
      e.forEach((e) => {
        const n = new FileReader();
        (n.onload = (n) => {
          const r = new Image();
          (r.onload = () => {
            let n = "original" === z.val() ? k(e.name) : z.val();
            "jpg" === n && (n = "jpeg");
            let h = parseFloat(y.val());
            "png" === k(e.name) && "png" === n && (n = "webp");
            let f = r.width;
            "no" !== F.val() && (f = parseInt(F.val()));
            let v = r.width,
              w = r.height;
            v > f && ((w *= f / v), (v = f));

            const C = document.createElement("canvas");

            const origWidth = r.width;
            const origHeight = r.height;

            let targetWidth = origWidth,
              targetHeight = origHeight;
            if (F.val() !== "no") {
              targetWidth = parseInt(F.val());
            }
            if (origWidth > targetWidth) {
              targetHeight = Math.round(origHeight * (targetWidth / origWidth));
            }

            C.width = targetWidth;
            C.height = targetHeight;
            C.getContext("2d").drawImage(r, 0, 0, targetWidth, targetHeight);

            let quality = parseFloat(y.val());
            if (k(e.name) === "png" && n === "png") {
              n = "webp";
            }
            let dataURL = C.toDataURL("image/" + n, quality);

            let blob = (function (dataURL) {
              const parts = dataURL.split(",");
              const mime = parts[0].match(/:(.*?);/)[1];
              const binary = atob(parts[1]);
              const array = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++)
                array[i] = binary.charCodeAt(i);
              return new Blob([array], { type: mime });
            })(dataURL);

            // টার্গেট সাইজ পেলেও সেটা থেকে বড় হলে পুনরায় কম্প্রেশন চালানো
            let targetBytes = parseFloat($("#target-size").val()) * 1024 * 1024;
            if (!isNaN(targetBytes) && blob.size > targetBytes) {
              // কোয়ালিটি ধাপে ধাপে কমিয়ে সাইজ লক্ষ্য করা
              while (blob.size > targetBytes && quality > 0.1) {
                quality -= 0.1;
                const compressedURL = C.toDataURL("image/" + n, quality);
                const compressedBlob = (function (dataURL) {
                  const parts = dataURL.split(",");
                  const mime = parts[0].match(/:(.*?);/)[1];
                  const binary = atob(parts[1]);
                  const array = new Uint8Array(binary.length);
                  for (let i = 0; i < binary.length; i++)
                    array[i] = binary.charCodeAt(i);
                  return new Blob([array], { type: mime });
                })(compressedURL);
                if (compressedBlob.size <= targetBytes) {
                  dataURL = compressedURL;
                  blob = compressedBlob;
                  break;
                }
                blob = compressedBlob;
              }
              // কোয়ালিটি কমিয়ে উদ্দেশ্য না হলে, রেজুলিউশন কমানো শুরু
              if (blob.size > targetBytes) {
                let newWidth = Math.floor(targetWidth * 0.8);
                let newHeight = Math.floor(targetHeight * 0.8);
                C.width = newWidth;
                C.height = newHeight;
                C.getContext("2d").drawImage(r, 0, 0, newWidth, newHeight);
                dataURL = C.toDataURL("image/" + n, quality);
                blob = (function (dataURL) {
                  const parts = dataURL.split(",");
                  const mime = parts[0].match(/:(.*?);/)[1];
                  const binary = atob(parts[1]);
                  const array = new Uint8Array(binary.length);
                  for (let i = 0; i < binary.length; i++)
                    array[i] = binary.charCodeAt(i);
                  return new Blob([array], { type: mime });
                })(dataURL);
              }
            }

            // চূড়ান্ত কম্প্রেসড ফাইল তৈরি ও আপডেট
            const compressedFile = new File([blob], "compressed-" + e.name, {
              type: "image/" + n,
            });
            s.push(compressedFile);
            i.push({
              originalFile: e,
              compressedFile: compressedFile,
              originalSize: e.size,
              compressedSize: blob.size,
              dataURL: dataURL,
              originalDimensions: origWidth + "×" + origHeight,
              compressedDimensions: C.width + "×" + C.height,
              originalFormat: k(e.name).toUpperCase(),
              compressedFormat: n.toUpperCase(),
            });

            a++;
            const L = Math.round((a / t) * 100);
            c.css("width", L + "%"),
              m.text(L + "%"),
              a === t &&
                (o
                  .prop("disabled", !1)
                  .html('<i class="fas fa-bolt"></i> Compress Images'),
                (function () {
                  u.hide(), p.show(), g.html("");
                  let e = 0,
                    s = 0;
                  i.forEach((i, t) => {
                    (e += i.originalSize), (s += i.compressedSize);
                    const a = Math.round(
                        ((i.originalSize - i.compressedSize) / i.originalSize) *
                          100
                      ),
                      n = $(
                        `\n              <div class="result-card">\n                <div class="result-preview">\n                  <div class="result-original">\n                    <div class="result-img"><img src="${URL.createObjectURL(
                          i.originalFile
                        )}"></div>\n                    <div>${
                          i.originalFile.name
                        }</div>\n                  </div>\n                  <div class="result-compressed">\n                    <div class="result-img"><img src="${
                          i.dataURL
                        }"></div>\n                    <div>${
                          i.compressedFile.name
                        }</div>\n                  </div>\n                </div>\n                <div class="result-stats">\n                  <div class="result-stat">${R(
                          i.originalSize
                        )} → ${R(
                          i.compressedSize
                        )}\n                    <div style="color:${
                          a > 0 ? "var(--secondary)" : "#ff4757"
                        }; font-weight:600;">\n                      ${
                          a > 0 ? a + "% smaller" : Math.abs(a) + "% larger"
                        }\n                    </div>\n                  </div>\n                  <div class="result-stat">${
                          i.originalDimensions
                        } → ${
                          i.compressedDimensions
                        }\n                    <div>${i.originalFormat} → ${
                          i.compressedFormat
                        }</div>\n                  </div>\n                </div>\n                <div class="result-actions">\n                  <button class="btn download-btn" data-index="${t}"><i class="fas fa-download"></i> Download</button>\n                </div>\n              </div>\n            `
                      );
                    g.append(n);
                  }),
                    $(".download-btn").on("click", function () {
                      !(function (e) {
                        const s = i[e],
                          t = document.createElement("a");
                        (t.href = URL.createObjectURL(s.compressedFile)),
                          (t.download = s.compressedFile.name),
                          document.body.appendChild(t),
                          t.click(),
                          document.body.removeChild(t);
                      })($(this).data("index"));
                    });
                  const t = Math.round(((e - s) / e) * 100);
                  b.text(
                    `Compressed ${i.length} images - ${R(s)} total (${
                      t > 0 ? t + "% savings" : Math.abs(t) + "% increase"
                    } from ${R(e)})`
                  );
                })(),
                l.show(),
                setTimeout(() => d.hide(), 800));
          }),
            (r.src = n.target.result);
        }),
          n.readAsDataURL(e);
      });
    }),
    r.on("click", function () {
      (e = []),
        (s = []),
        (i = []),
        a.val(""),
        h.hide(),
        p.hide(),
        d.hide(),
        u.css("display", "grid"),
        l.hide(),
        v.html('<i class="fas fa-image"></i>'),
        w.html('<i class="fas fa-image"></i>'),
        $(
          "#original-size, #original-dimensions, #original-format, #compressed-size, #compressed-dimensions, #compressed-format"
        ).text("-"),
        b.text("Upload images to see compression results"),
        o
          .prop("disabled", !1)
          .html('<i class="fas fa-bolt"></i> Compress Images Now');
    }),
    l.on("click", function () {
      const e = new JSZip();
      s.forEach((s) => e.file(s.name, s)),
        e
          .generateAsync({ type: "blob" })
          .then((e) => saveAs(e, "compressed-images.zip"));
    }),
    C.on("click", function () {
      x.toggleClass("active"),
        $(this).html(
          x.hasClass("active")
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>'
        );
    }),
    $(".faq-question").on("click", function () {
      const e = $(this),
        s = e.next(".faq-answer"),
        i = e.hasClass("active");
      $(".faq-question").removeClass("active"),
        $(".faq-answer").css("maxHeight", null),
        i ||
          (e.addClass("active"),
          s.css("maxHeight", s.prop("scrollHeight") + "px"));
    });
});
