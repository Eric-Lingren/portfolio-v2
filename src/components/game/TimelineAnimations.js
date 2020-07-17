import { TimelineMax, SteppedEase } from 'gsap'

// export function introTimeline(){
//     const masterTimeline = new TimelineMax()
//     masterTimeline.add(line1Timeline)
//         .add(endTypewriter1, 2.5)
//         .add(line2Timeline, 2.5)
//         .add(endTypewriter2, 6)
//         .add(line3Timeline, 0) //6
//         .from("#progress", masterTimeline.duration(), {scaleX:0, transformOrigin:"left center"}, 0)

// }

export function line1Timeline(){
    let tl = new TimelineMax( { paused: true } )
        // letter animation
        tl.fromTo(".animate-typewriter-cursor", 4, {
            width: "0",
        }, {
            width: "40%",
            ease:  SteppedEase.config(37)
        }, 0);
        
        // text cursor animation
        tl.fromTo(".animate-typewriter-cursor", .75, {
        "border-right-color": "rgba(255,255,255,0.75)"
        }, {
        "border-right-color": "rgba(255,255,255,0)",
        repeat: -1,
        ease:  SteppedEase.config(37)
        }, 0);
        
        tl.play()
        // setTimeout( () => {tl.kill()}, 3000)
}

export function line2Timeline(){
    let tl = new TimelineMax( { paused: true } )
        // letter animation
        tl.fromTo(".animate-typewriter-cursor", 4, {
            width: "0",
            opacity: 1
        }, {
            width: "60%",
            ease:  SteppedEase.config(37),
            yoyo: true
        }, 0);
        
        // text cursor animation
        tl.fromTo(".animate-typewriter-cursor", .75, {
        "border-right-color": "rgba(255,255,255,0.75)"
        }, {
        "border-right-color": "rgba(255,255,255,0)",
        repeat: -1,
        ease:  SteppedEase.config(37)
        }, 0);
        
        tl.play()
}


export function line3Timeline(){
    let tl = new TimelineMax( { paused: true } )
        // letter animation
        tl.fromTo(".animate-typewriter-cursor", 1, {
            width: "0",
            opacity: 1
        }, {
            width: "20%",
            ease:  SteppedEase.config(15),
            yoyo: true,
            repeat: -1,
            repeatDelay: .75,
        }, 0);
        
        // text cursor animation
        tl.fromTo(".animate-typewriter-cursor", .75, {
        "border-right-color": "rgba(255,255,255,0.75)"
        }, {
        "border-right-color": "rgba(255,255,255,0)",
        repeat: -1,
        ease:  SteppedEase.config(37)
        }, 0);
        
        tl.play()
}


export function line7Timeline(){
    let tl = new TimelineMax( { paused: true } )
        // letter animation
        tl.fromTo(".animate-typewriter-cursor", 3, {
            width: "0",
            opacity: 1
        }, {
            width: "40%",
            ease:  SteppedEase.config(25),
        }, 0);
        
        // text cursor animation
        tl.fromTo(".animate-typewriter-cursor", .75, {
        "border-right-color": "rgba(255,255,255,0.75)"
        }, {
        "border-right-color": "rgba(255,255,255,0)",
        repeat: -1,
        ease:  SteppedEase.config(37)
        }, 0);
        
        tl.play()
}

