// import invaderLogo from '../../assets/invader-logo.png'
// import { TweenMax, Linear } from 'gsap'


// export function homeLogoAnimation( scale, ctx, canvas ){

//     const img = new Image();
//     img.onload = init;
//     img.src = invaderLogo

//     function init() {
//         TweenMax.from(scale, 4, {
//             value: 1,
//             ease: Linear.easeNone,
//             onUpdate: update,
//             repeat: 0,
//             opacity: 1,
//             delay: 2
//         });
//         TweenMax.to(canvas, 3, { opacity: 0, delay: 3 })
//         update()
//     }
    
//     function update() {
//         var sw = (canvas.width / scale.value) >> 0
//         var sh = (canvas.height / scale.value) >> 0
//         ctx.drawImage(img, 0, 0, sw, sh);
//         ctx.drawImage(canvas, 0, 0, sw, sh, 0, 0, canvas.width, canvas.height) 
//     } 
// }