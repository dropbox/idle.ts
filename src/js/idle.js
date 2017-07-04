"use strict";
exports.__esModule = true;
var EVENTS_ARRAY = [
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
var DEFAULT_ACTIVITY_REPORT_IN_SEC = 5;
var Idle = (function () {
    function Idle(options) {
        var _this = this;
        this.userReportedActive = false; // used for advanced mode
        this.userIsActive = false; //used for standard mode
        this.userMouseIsInFrame = false;
        this.attachedFrames = [];
        this.activityReportMode = 2 /* Advanced */;
        this.activityReportInSec = DEFAULT_ACTIVITY_REPORT_IN_SEC;
        this.detectFramesInSec = -1;
        this.onActivity = function () { };
        this.onEnterFrame = function () { };
        this.onReportUserIsActive = function () { };
        this.onReportUserIsIdle = function () { };
        this.attachListenerToNewFrames = function () {
            var frames = Array.prototype.slice.call(document.getElementsByTagName('frame'));
            var iframes = Array.prototype.slice.call(document.getElementsByTagName('iframe'));
            var allFrames = frames.concat(iframes);
            for (var _i = 0, allFrames_1 = allFrames; _i < allFrames_1.length; _i++) {
                var frame = allFrames_1[_i];
                if (_this.attachedFrames.indexOf(frame) < 0) {
                    frame.addEventListener("mouseenter", _this.onMouseEntersFrame.bind(_this), _this, false);
                    _this.attachedFrames.push(frame);
                    // We can't know if the mouse is within the new frame already, so we guess it is.
                    // If its not we would find out upon any user activity
                    _this.userMouseIsInFrame = true;
                }
            }
        };
        this.onUserActivity = function () {
            _this.onActivity();
            _this.userIsActive = true;
            if (_this.activityReportMode === 2 /* Advanced */ && !_this.userReportedActive) {
                _this.reportActivity();
            }
            // user is active => user is not in a frame
            _this.userMouseIsInFrame = false;
        };
        this.overrideDefaultsWithOptions(options);
        EVENTS_ARRAY.forEach(function (event) {
            addEventListener(event, _this.onUserActivity, false);
        });
        setInterval(this.onTimerTick.bind(this), this.activityReportInSec * 1000);
        if (this.detectFramesInSec > 0) {
            setInterval(this.attachListenerToNewFrames, this.detectFramesInSec * 1000);
        }
        // activity signal is sent when the page loaded
        this.reportActivity();
    }
    Idle.prototype.onMouseEntersFrame = function () {
        this.onEnterFrame();
        this.userMouseIsInFrame = true;
    };
    Idle.prototype.onTimerTick = function () {
        this.userReportedActive = false;
        if ((this.activityReportMode === 1 /* Standard */ && this.userIsActive) ||
            (this.userMouseIsInFrame && this.isPageVisible())) {
            this.reportActivity();
        }
        else {
            this.onReportUserIsIdle();
        }
    };
    Idle.prototype.reportActivity = function () {
        this.onReportUserIsActive();
        this.userReportedActive = true;
        this.userIsActive = false;
    };
    Idle.prototype.overrideDefaultsWithOptions = function (options) {
        this.activityReportInSec = options.activityReportInSec || this.activityReportInSec;
        this.activityReportMode = options.activityReportMode || this.activityReportMode;
        this.detectFramesInSec = options.detectFramesInSec || this.detectFramesInSec;
        this.onActivity = options.onActivity || this.onActivity;
        this.onEnterFrame = options.onEnterFrame || this.onEnterFrame;
        this.onReportUserIsActive = options.onReportUserIsActive || this.onReportUserIsActive;
        this.onReportUserIsIdle = options.onReportUserIsIdle || this.onReportUserIsIdle;
    };
    Idle.prototype.isPageVisible = function () {
        // return true for "visible" / "prerender" / "undefined" (unsupported browsers)
        return document.visibilityState !== "hidden";
    };
    return Idle;
}());
exports.Idle = Idle;
