const fs = require('fs');
const pdf = require('pdfjs');

const defaultConfig = {
    resource: '',
    output: 'output.pdf',

    sticker: {
        width: null,
        height: null,
    },

    paper: {
        width: 210,
        height: 297,
    },

    bleed: {
        top: 0,
        bottom: 0,

        left: 0,
        right: 0,
    },

    gutter: {
        horizontal: 0,
        vertical: 0,
    }
};

function generatePrintsheet(specificConfig) {
    let config = {
        ...defaultConfig,
        ...specificConfig,
    };

    const src = fs.readFileSync(config.resource);
    const img = new pdf.Image(src);

    if (!config.sticker.height) {
        config.sticker.height = (config.sticker.width / img.width) * img.height;
    }

    if (!config.sticker.width) {
        config.sticker.width = (config.sticker.height / img.height) * img.width;
    }

    let area = {
        width: config.paper.width - config.bleed.left - config.bleed.right,
        height: config.paper.height - config.bleed.top - config.bleed.bottom,
    };

    const colCount = Math.floor((area.width + config.gutter.horizontal) / (config.sticker.width + config.gutter.horizontal));
    const rowCount = Math.floor((area.height + config.gutter.vertical) / (config.sticker.height + config.gutter.vertical));

    const content = {
        width: (colCount * (config.sticker.width + config.gutter.horizontal)) - config.gutter.horizontal,
        height: (rowCount * (config.sticker.height + config.gutter.vertical)) - config.gutter.vertical,
    };

    // ===== Generate PDF =====

    let doc = new pdf.Document({
        width: config.paper.width * pdf.mm,
        height: config.paper.height * pdf.mm,
        padding: 0,
        font: new pdf.Font(require('pdfjs/font/helvetica.json')),
    });

    doc.pipe(fs.createWriteStream(config.output));

    const offset = {
        x: (config.paper.width - content.width) / 2,
        y: (config.paper.height - content.height) / 2,
    }

    for(let i = 0; i < rowCount; i++) {
        for(let j = 0; j < colCount; j++) {
            let x = (config.sticker.width + config.gutter.horizontal) * j + offset.x;
            let y = (config.sticker.height + config.gutter.vertical) * i + offset.y;

            doc.image(img, {
                width: config.sticker.width * pdf.mm,
                height: config.sticker.height * pdf.mm,
                x: x * pdf.mm,
                y: (config.paper.height - y) * pdf.mm,
                wrap: false,
            });
        }
    }


    doc.end().then(() => {
        console.log(`Fitted ${colCount * rowCount} items.`)
    });

}

module.exports = {
    generatePrintsheet,
    defaultConfig,
};
