mport {Idle} from "idle";
import {ReportMode} from "idle";

const intervalTimeInSec = 5;
const intervalTime = intervalTimeInSec*1000;
const framesDetectionIntervalTimeInSec = 30;
const framesDetectionIntervalTime = framesDetectionIntervalTimeInSec*1000;

let userActivity: Idle;
let onActivitySpy: jasmine.Spy;
let execOnEnterFrameSpy: jasmine.Spy;
let onReportUserIsActiveSpy: jasmine.Spy;
let onReportUserIsIdleSpy: jasmine.Spy;

const initSpies = () => {
    onActivitySpy = jasmine.createSpy("onActivitySpy");
    execOnEnterFrameSpy = jasmine.createSpy("execOnEnterFrameSpy");
    onReportUserIsActiveSpy= jasmine.createSpy("onReportUserIsActiveSpy");
    onReportUserIsIdleSpy = jasmine.createSpy("onReportUserIsIdleSpy");
};

describe("onReportUserIsActive are called on advanced mode", () => {

    beforeEach(() => {
        initSpies();

        const options = {
            activityReportInSec: intervalTimeInSec,
            activityReportMode: ReportMode.Advanced,
            detectFramesInSec: framesDetectionIntervalTimeInSec,
            onReportUserIsActive: onReportUserIsActiveSpy,
        };

        jasmine.clock().install();
        userActivity = new Idle(options);
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    // We expect one call to the onReportUserIsActive as the object is created.
    // another call should be done only if the user was active after the interval elapsed.
    it("every click after interval elapsed calls the onReportUserIsActive", () => {
        jasmine.clock().tick(intervalTime);
        window.document.body.click();
        expect(onReportUserIsActiveSpy.calls.count()).toBe(2);
        jasmine.clock().tick(intervalTime);
        window.document.body.click();
        expect(onReportUserIsActiveSpy.calls.count()).toBe(3);
    });

    it("onReportUserIsActive is not called for user activity until the interval elapses", () => {
        window.document.body.click();
        jasmine.clock().tick(intervalTime-1);
        window.document.body.click();
        expect(onReportUserIsActiveSpy.calls.count()).toBe(1);
    });

    it("onReportUserIsActive is not called when user is idle within the interval", () => {
        window.document.body.click();
        jasmine.clock().tick(intervalTime);
        expect(onReportUserIsActiveSpy.calls.count()).toBe(1);
    });

    it("onReportUserIsActive is called on timer tick when mouse in frame", () => {
        spyOn(Idle.prototype, "isPageVisible").and.callFake(()=>{return true;});
        expect(onReportUserIsActiveSpy.calls.count()).toBe(1);
        userActivity.onMouseEntersFrame();
        jasmine.clock().tick(intervalTime);
        expect(onReportUserIsActiveSpy.calls.count()).toBe(2);
        jasmine.clock().tick(intervalTime);
        expect(onReportUserIsActiveSpy.calls.count()).toBe(3);
    });

    it("onReportUserIsActive stopped being called when user makes operation outside the frame", () => {
        spyOn(Idle.prototype, "isPageVisible").and.callFake(()=>{return true;});
        expect(onReportUserIsActiveSpy.calls.count()).toBe(1);
        userActivity.onMouseEntersFrame();
        jasmine.clock().tick(intervalTime);
        expect(onReportUserIsActiveSpy.calls.count()).toBe(2);
        window.document.body.click();
        expect(onReportUserIsActiveSpy.calls.count()).toBe(2);
        jasmine.clock().tick(intervalTime);
        window.document.body.click();
        expect(onReportUserIsActiveSpy.calls.count()).toBe(3);
    });

    it("onReportUserIsActive is not called when page is not visible", () => {
        spyOn(Idle.prototype, "isPageVisible").and.callFake(()=>{return false;});
        expect(onReportUserIsActiveSpy.calls.count()).toBe(1);
        userActivity.onMouseEntersFrame();
        jasmine.clock().tick(intervalTime);
        expect(onReportUserIsActiveSpy.calls.count()).toBe(1);
    });

    it("frames are attached with events and added to list once", () => {
        const frame = document.createElement("FRAME");
        const addEventListener = spyOn(frame, "addEventListener").and.callFake(()=>{});
        document.body.appendChild(frame);
        expect(addEventListener.calls.count()).toBe(0);
        expect(userActivity.attachedFrames.length).toBe(0);
        jasmine.clock().tick(framesDetectionIntervalTime);
        expect(userActivity.attachedFrames.length).toBe(1);
        expect(addEventListener.calls.count()).toBe(1);
        jasmine.clock().tick(framesDetectionIntervalTime);
        expect(userActivity.attachedFrames.length).toBe(1);
        expect(addEventListener.calls.count()).toBe(1);
    });
});
