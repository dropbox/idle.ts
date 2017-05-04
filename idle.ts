const EVENTS_ARRAY = [
    "keypress",
    "keydown",
    "click",
    "contextmenu",
    "dblclick",
    "mousemove",
    "scroll",
    "touchmove",
    "touchstart"
];

export const enum ReportMode {
    Standard = 1,
    Advanced = 2,
}

const DEFAULT_ACTIVITY_REPORT_IN_SEC = 5;

export interface Options {
  activityReportInSec?: number;
  activityReportMode?: ReportMode;
  detectFramesInSec?: number;
  onActivity?: ()=>void;
  onEnterFrame?: ()=>void;
  onReportUserIsActive?: ()=>void;
  onReportUserIsIdle?: ()=>void;
}

export class Idle {
    userReportedActive: boolean = false; // used for advanced mode
    userIsActive: boolean = false; //used for standard mode
    userMouseIsInFrame: boolean = false;
    attachedFrames: HTMLElement[] = [];
    activityReportMode: ReportMode = ReportMode.Advanced;
    activityReportInSec: number = DEFAULT_ACTIVITY_REPORT_IN_SEC;
    detectFramesInSec: number = -1;
    onActivity: ()=>void = ()=>{};
    onEnterFrame: ()=>void = ()=>{};
    onReportUserIsActive: ()=>void = ()=>{};
    onReportUserIsIdle: ()=>void = ()=>{};


    constructor (options: Options) {
        this.overrideDefaultsWithOptions(options);

        EVENTS_ARRAY.forEach((event) => {
            window.addEventListener(event, this.onUserActivity, false);
        });

        setInterval(this.onTimerTick.bind(this), this.activityReportInSec * 1000);

        if (this.detectFramesInSec > 0) {
            setInterval(this.attachListenerToNewFrames, this.detectFramesInSec * 1000);
        }

        // activity signal is sent when the page loaded
        this.reportActivity();
    }


    attachListenerToNewFrames = () => {
        const frames = Array.prototype.slice.call(window.document.getElementsByTagName('frame'));
        const iframes = Array.prototype.slice.call(window.document.getElementsByTagName('iframe'));
        const allFrames = frames.concat(iframes);
        for (const frame of allFrames) {
            if (this.attachedFrames.indexOf(frame) < 0) {
                frame.addEventListener("mouseenter", this.onMouseEntersFrame.bind(this), this, false);
                this.attachedFrames.push(frame);
                // We can't know if the mouse is within the new frame already, so we guess it is.
                // If its not we would find out upon any user activity
                this.userMouseIsInFrame = true;
            }
        }
    }

    onUserActivity = () => {
        this.onActivity();
        this.userIsActive = true;

        if (this.activityReportMode === ReportMode.Advanced && !this.userReportedActive) {
            this.reportActivity();
        }
        // user is active => user is not in a frame
        this.userMouseIsInFrame = false;
    }

    public onMouseEntersFrame() {
        this.onEnterFrame();
        this.userMouseIsInFrame = true;

    }

    private onTimerTick() {
        this.userReportedActive = false;
        if ((this.activityReportMode === ReportMode.Standard && this.userIsActive) ||
            (this.userMouseIsInFrame && this.isPageVisible())) {
            this.reportActivity();
        } else {
            this.onReportUserIsIdle();
        }
    }

    private reportActivity() {
        this.onReportUserIsActive();
        this.userReportedActive = true;
        this.userIsActive = false;
    }

    private overrideDefaultsWithOptions(options: Options) {
        this.activityReportInSec = options.activityReportInSec || this.activityReportInSec;
        this.activityReportMode = options.activityReportMode || this.activityReportMode;
        this.detectFramesInSec = options.detectFramesInSec || this.detectFramesInSec;
        this.onActivity = options.onActivity || this.onActivity;
        this.onEnterFrame = options.onEnterFrame || this.onEnterFrame;
        this.onReportUserIsActive = options.onReportUserIsActive || this.onReportUserIsActive;
        this.onReportUserIsIdle = options.onReportUserIsIdle || this.onReportUserIsIdle;
    }

    private isPageVisible() {
        // return true for "visible" / "prerender" / "undefined" (unsupported browsers)
        return window.document.visibilityState !== "hidden";
    }


}
