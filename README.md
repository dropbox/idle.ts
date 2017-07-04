# idle.ts  :running: -> :sleeping: -> :running: -> :running: -> :sleeping:
idle.ts is a small typescript / javascript lib that helps you indicate whether a user is active or idle. You can use this to get events about the user activitness, and create your own actions - log activity, sign idle users out, show warning modal, etc. 
The library also offers smart batching with optiomal balance between accuracy and effiency.

## Install 
`npm install idle.ts`
Or copy idle.ts (for typescript) or idle.js (for javascript) to your location

## Testing 
Use attached jasmine file for testing. Add this to your site and browse to using jasmine framework

## Usage
Start listening to user activity by calling 
`let idle = Idle(...)`
### Provide the following parameters to Idle(...) constructor:
 - `activityReportInSec?: number;` The number of seconds interval a report about user activity is sent.
 - `activityReportMode?: ReportMode` see [Smart Batching](https://github.com/dropbox/idle.ts/#smart-batching)
 - `detectFramesInSec?: number;` Frames can be added dynamicaly after the page was already created. If the page you inpect creates frames after loaded set the interval time, in which the dicovery frames code may run. By default, it only runs once the page is loaded
 - `onActivity?: ()=>void;` a event called when a user is starting to be active after being idle
 - `onEnterFrame?: ()=>void;` a event called when a user enters a frame and listener can't listen to any page event
 - `onReportUserIsActive?: ()=>void;` a periodic report states that the user was being active on the last interval checked.
 - `onReportUserIsIdle?: ()=>void;` a periodic report states that the user was being idle on the last interval checked.

## Smart Batching 
### Batch Events in order to reduce load

In order to reduce load on the server we don’t want to call the refresh cookie url, upon every event that we catch. We should check if the user made an activity over X minutes, and call the endpoint if he was active. So how do we set this X interval to the optimal time?

- If we make it to long - we can lose events. A user can be active and close the browser /  disconnect from the internet, before activity report was sent
- If we make it too short we can overload the server

### Basic triggering - log every X minutes

#### Outline 
send report every 5 minutes if user was active
#### How?
upon user activity - raise flag
every 5 minutes - if flag is raised, call endpoint to refresh cookie. drop flag.

<p align="center">
  <img src="https://d2mxuefqeaa7sj.cloudfront.net/s_33EDBD43C0EA8660E917B7F629C0D017AB6553EF67BEFFB560FDFCD15F7392D1_1490691504767_Screen+Shot+2017-03-28+at+11.57.59+AM.png"/>
</p>

#### Edge case:
User makes an operation and closes the browser before 5 minutes elapsed and cookie is not refreshed
“Real world” scenarios (derived from the edge case):
##### Scenario A:

1. Admin sets the idle timeout to 30 minutes.
2. User opens a page.
3. User is inactive for 15 minutes.
4. User makes an operation and closes the page.
5. 30 minutes elapsed and user is kicked out, despite of his activity.

##### Scenario B:

1. Admin sets the idle timeout to 30 minutes.
2. User opens a page.
3. User is inactive for 27 minutes.
4. User goes back to the page, and does many operations.
5. 30 minutes elapsed and user is kicked out, while active.

### Advanced triggering - send report on ‘first’ user activity every 5 minutes

#### How?
upon user activity - if flag is dropped, call endpoint to refresh cookie and raise flag
every 5 minutes - drop flag

<p align="center">
  <img src="https://d2mxuefqeaa7sj.cloudfront.net/s_33EDBD43C0EA8660E917B7F629C0D017AB6553EF67BEFFB560FDFCD15F7392D1_1490691569189_Screen+Shot+2017-03-28+at+11.59.06+AM.png"/>
</p>


#### Edge case:
User makes an operation and closes the browser before “the first operation after 5 minutes” and cookie is not refreshed
“Real world” scenarios (derived from the edge case):
User can be Session can be shorter than expected:

1. Admin sets team’s timeout to 10 minutes
2. User makes an operation on minute 00:01. Cookie is refreshed.
3. User makes an operation on minute 04:59. Cookie is not refreshed.
4. On minutes 10:01 user session expires, though user was only idle for 5:01 minutes

#### Bottom line
Session can be shorter than the expected idle timeout by the interval time (see the table above for the interval times we set for each preset timeout).
For example: if the admin sets the idle timeout to 8 hours, users should be kicked out after 7.5-8 hours (30 minutes interval)  

