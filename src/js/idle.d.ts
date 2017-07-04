export declare const enum ReportMode {
    Standard = 1,
    Advanced = 2,
}
export interface Options {
    activityReportInSec?: number;
    activityReportMode?: ReportMode;
    detectFramesInSec?: number;
    onActivity?: () => void;
    onEnterFrame?: () => void;
    onReportUserIsActive?: () => void;
    onReportUserIsIdle?: () => void;
}
export declare class Idle {
    userReportedActive: boolean;
    userIsActive: boolean;
    userMouseIsInFrame: boolean;
    attachedFrames: HTMLElement[];
    activityReportMode: ReportMode;
    activityReportInSec: number;
    detectFramesInSec: number;
    onActivity: () => void;
    onEnterFrame: () => void;
    onReportUserIsActive: () => void;
    onReportUserIsIdle: () => void;
    constructor(options: Options);
    attachListenerToNewFrames: () => void;
    onUserActivity: () => void;
    onMouseEntersFrame(): void;
    private onTimerTick();
    private reportActivity();
    private overrideDefaultsWithOptions(options);
    isPageVisible(): boolean;
}
