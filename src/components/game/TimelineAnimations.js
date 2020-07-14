import { TimelineMax, SteppedEase } from 'gsap'

export function introTimeline(){
    const masterTimeline = new TimelineMax()
    masterTimeline.add(line3Timeline)
        .add(endTypewriter1, 2.5)
        .add(line2Timeline, 2.5)
        .add(endTypewriter2, 6)
        .add(line3Timeline, 6)
        .from("#progress", masterTimeline.duration(), {scaleX:0, transformOrigin:"left center"}, 0)

}

function line1Timeline(){
    let tl = new TimelineMax( { paused: true } )
        // letter animation
        tl.fromTo(".animate-typewriter-cursor", 5, {
            width: "0",
        }, {
            width: "60%",
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

function endTypewriter1(){
    let tl = new TimelineMax( { paused: true } )
    tl.fromTo(".animate-typewriter-cursor", 4, {
        opacity: "0",
    }, {
        width: "60%",
        ease:  SteppedEase.config(37)
    }, 0);
}



function line2Timeline(){
    let tl = new TimelineMax( { paused: true } )
        // letter animation
        tl.fromTo(".animate-typewriter-cursor2", 4, {
            width: "0",
            opacity: 1
        }, {
            width: "60%",
            ease:  SteppedEase.config(37),
            yoyo: true
        }, 0);
        

        // text cursor animation
        tl.fromTo(".animate-typewriter-cursor2", .75, {
        "border-right-color": "rgba(255,255,255,0.75)"
        }, {
        "border-right-color": "rgba(255,255,255,0)",
        repeat: -1,
        ease:  SteppedEase.config(37)
        }, 0);
        
        tl.play()
        // setTimeout( () => {tl.kill()}, 3000)
}

function endTypewriter2(){
    let tl = new TimelineMax( { paused: true } )
    tl.fromTo(".animate-typewriter-cursor2", 4, {
        opacity: "0",
    }, {
        width: "60%",
        ease:  SteppedEase.config(37)
    }, 0);
}

function line3Timeline(){
    let tl = new TimelineMax( { paused: true } )
        // letter animation
        tl.fromTo(".animate-typewriter-cursor3", 4, {
            width: "0",
            opacity: 1
        }, {
            width: "60%",
            ease:  SteppedEase.config(37)
        }, 0);
        

        // text cursor animation
        tl.fromTo(".animate-typewriter-cursor3", .75, {
        "border-right-color": "rgba(255,255,255,0.75)"
        }, {
        "border-right-color": "rgba(255,255,255,0)",
        repeat: -1,
        ease:  SteppedEase.config(37)
        }, 0);
        
        tl.play()
}

function endTypewriter3(){
    let tl = new TimelineMax( { paused: true } )
    tl.fromTo(".animate-typewriter-cursor3", 4, {
        opacity: "0",
    }, {
        width: "60%",
        ease:  SteppedEase.config(37)
    }, 0);
}