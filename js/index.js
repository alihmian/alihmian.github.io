const log = console.log;

const canvasSize = 200;

// Create main Konva stage (canvas)
const stage = new Konva.Stage({
    container: "konva-holder",
    width: canvasSize,
    height: canvasSize,
});

// Create three layers: base (template), user image, overlay
const baseLayer = new Konva.Layer();
const userLayer = new Konva.Layer();
const overlayLayer = new Konva.Layer();

stage.add(baseLayer);
stage.add(userLayer);
stage.add(overlayLayer);

let transformer; // global reference

// Load base template image (background)
Konva.Image.fromURL('/base_news_template.png', function (bg) {
    console.log("Base template loaded ✅");
    bg.setAttrs({
        x: 0,
        y: 0,
        width: canvasSize,
        height: canvasSize,
    });
    baseLayer.add(bg);
    baseLayer.draw();
});

// let lastDist = 0;
// let scale = 1;

// stage.on('touchmove', function (e) {
//     e.evt.preventDefault(); // prevents scrolling on touch devices

//     let touch1 = e.evt.touches[0];
//     let touch2 = e.evt.touches[1];

//     if (touch1 && touch2) {
//         // calculate the distance between two fingers
//         let dist = Math.hypot(
//             touch1.clientX - touch2.clientX,
//             touch1.clientY - touch2.clientY
//         );

//         if (!lastDist) {
//             lastDist = dist;
//         }

//         // calculate new scale based on the ratio of distance
//         let scaleBy = dist / lastDist;

//         scale *= scaleBy;

//         // set scale limits if you want
//         scale = Math.max(0.2, Math.min(scale, 5));

//         userLayer.scale({ x: scale, y: scale });
//         userLayer.batchDraw();

//         lastDist = dist;
//     }
// });

// stage.on('touchend', function () {
//     lastDist = 0;
// });


// Better pinch zoom logic:
// let lastCenter = null;
// let lastDist = 0;

// stage.on('touchmove', function (e) {
//     e.evt.preventDefault();

//     let touch1 = e.evt.touches[0];
//     let touch2 = e.evt.touches[1];

//     if (touch1 && touch2) {
//         let p1 = {
//             x: touch1.clientX,
//             y: touch1.clientY
//         };
//         let p2 = {
//             x: touch2.clientX,
//             y: touch2.clientY
//         };

//         let dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
//         let center = {
//             x: (p1.x + p2.x) / 2,
//             y: (p1.y + p2.y) / 2,
//         };

//         if (!lastDist) {
//             lastDist = dist;
//             lastCenter = center;
//             return;
//         }

//         // Calculate scale factor based on pinch movement
//         let scaleBy = dist / lastDist;
//         let oldScale = stage.scaleX();
//         let newScale = oldScale * scaleBy;

//         // Limit scale
//         newScale = Math.max(0.5, Math.min(newScale, 5));

//         // Adjust stage position to keep pinch centered
//         let mousePointTo = {
//             x: (center.x - stage.x()) / oldScale,
//             y: (center.y - stage.y()) / oldScale,
//         };

//         stage.scale({ x: newScale, y: newScale });

//         let newPos = {
//             x: center.x - mousePointTo.x * newScale,
//             y: center.y - mousePointTo.y * newScale,
//         };

//         stage.position(newPos);
//         stage.batchDraw();

//         lastDist = dist;
//         lastCenter = center;
//     }
// });

// stage.on('touchend', function () {
//     lastDist = 0;
//     lastCenter = null;
// });



// Variables to track pinch distance and center
var lastDist = 0;
var lastCenter = null;

stage.on('touchmove', function (e) {
    e.evt.preventDefault();

    // if two fingers are touching the screen at the same time
    if (e.evt.touches.length === 2) {
        var touch1 = e.evt.touches[0];
        var touch2 = e.evt.touches[1];

        // get distance between the two fingers
        var dist = getDistance(
            { x: touch1.clientX, y: touch1.clientY },
            { x: touch2.clientX, y: touch2.clientY }
        );

        // get the center position of the two fingers
        var center = getCenter(
            { x: touch1.clientX, y: touch1.clientY },
            { x: touch2.clientX, y: touch2.clientY }
        );

        // if this is the first touchmove event with two fingers
        if (!lastDist) {
            lastDist = dist;
        }

        // get ratio needed to scale the stage
        var scale = stage.scaleX() * (dist / lastDist);

        // limit scale if necessary
        // e.g. Math.max(0.5, Math.min(scale, 3));
        // but leaving it unlimited here
        stage.scale({ x: scale, y: scale });

        // calculate new position to keep pinch center stable
        if (lastCenter) {
            var dx = center.x - lastCenter.x;
            var dy = center.y - lastCenter.y;
            var newPos = {
                x: stage.x() + dx,
                y: stage.y() + dy
            };
            stage.position(newPos);
        }

        stage.batchDraw();

        lastDist = dist;
        lastCenter = center;
    }
});

// reset trackers on touchend
stage.on('touchend', function () {
    lastDist = 0;
    lastCenter = null;
});

// helper functions
function getDistance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function getCenter(p1, p2) {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
    };
}

// Load user image (draggable and resizable)
Konva.Image.fromURL('/user_uploaded_image.png', function (userImg) {
    console.log("User image loaded ✅");
    userImg.setAttrs({
        x: 0,
        y: 0,
        draggable: true,
        width: canvasSize,
        height: canvasSize,
    });

    userLayer.add(userImg);

    transformer = new Konva.Transformer({
        nodes: [userImg],
        rotateEnabled: false,
        boundBoxFunc: (oldBox, newBox) => {
            if (newBox.width < 100 || newBox.height < 100) {
                return oldBox;
            }
            return newBox;
        }
    });

    userLayer.add(transformer);
    userLayer.draw();
});

// Load overlay image (top frame)
Konva.Image.fromURL('/overlay.png', function (overlay) {
    console.log("Overlay loaded ✅");
    overlay.setAttrs({
        x: 0,
        y: 0,
        width: canvasSize,
        height: canvasSize,
        listening: false
    });
    overlayLayer.add(overlay);
    overlayLayer.draw();
});

// Extract token from URL path (e.g., /crop/abc123)
function getTokenFromURL() {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1];
}

// Handle export and submit to server
document.getElementById('export-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = getTokenFromURL();

    // Remove transformer before exporting
    if (transformer) transformer.detach();
    userLayer.draw();

    const dataURL = stage.toDataURL({ pixelRatio: 2 }); // high quality
    const base64 = dataURL.split(',')[1];

    try {
        const response = await fetch(`/save-cropped-image/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 })
        });

        const message = document.getElementById('message');
        message.style.display = 'block';

        if (response.ok) {
            message.textContent = '✅ Changes saved. You can now close this window and go back to Telegram.';
        } else {
            message.textContent = '❌ Failed to save image. Try again.';
            message.style.color = 'red';
        }
    } catch (err) {
        console.error('Error saving image:', err);
        const message = document.getElementById('message');
        message.textContent = '❌ An error occurred. Check your internet or try again.';
        message.style.display = 'block';
        message.style.color = 'red';
    }
});

// Auto-scale canvas for display
function scaleCanvasToFit() {
    const container = document.getElementById('canvas-container');
    const holder = document.getElementById('konva-holder');
    const scale = container.offsetWidth / canvasSize;

    holder.style.transform = `scale(${scale})`;
    holder.style.transformOrigin = 'top left';
}

// Run on load and resize
window.addEventListener('load', scaleCanvasToFit);
window.addEventListener('resize', scaleCanvasToFit);
