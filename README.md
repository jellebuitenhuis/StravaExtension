# Strava Ranks Chrome Extension

Because Strava removed some options from segments, but still sends the data in their API requests, I've decided to show that data again. 

### Features:
  * You can now sort the table containing your segments, just click on the relevant table header
  * On each segment you can see your personal rank, the total amount of attempts, and the percentile of your best attempt
  * You can see all attempts you made on a segment
  * The analyse button on the activity page now works
  * The analyse button on a bike segment now brings you to the analysis page with the segment selected
  * Compare any two activities on the flyby screen. Use the following pattern: https:\/\/labs\.strava\.com\/flyby\/viewer\/#`\d+(\/\d+)+`
    * If you add `?equalize=true` all flyby's will have the same starting time
    * E.g. `https://labs.strava.com/flyby/viewer/#4267063442/4266960806/4267455658?equalize=true`
      * `4267063442` is the main activity id to compare against
      *  `4266960806` and `4267455658` are the activities to be compared against. This list can be infinitely big
      * `?equalize=true` equalizes all starting times  
### Installation:
1. Grab and extract the zipfile [StravaExtension.zip](/StravaExtension.zip)
2. Open [chrome://extensions](chrome://extensions)
3. In the topright click on "Developer mode"
4. Click on "Load unpacked"
5. Point to the unpacked zipfile