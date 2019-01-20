# What and Why

__Standard Disclaimer: I am not a developer, I don't even play one on YouTube.
I just like imagining I could be one when I grow up.__

This is a simple
[Node](https://nodejs.org)
app utilizing
[promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
and
[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
to simulate a healthcheck pattern designed to work with
[Cloud Foundry](https://www.cloudfoundry.org).
First a small (I promise) bit of history for context...

Cloud Foundry (CF) has a concept of a "health checks".  These can take many forms,
but the preferred approach is HTTP.  Apps can expose a `/healthcheck` endpoint
which the
[Cloud Controller](https://docs.cloudfoundry.org/concepts/architecture/cloud-controller.html)
polls.  If an app becomes unhealthy (indicated by
HTTP status code), restart/repair is attempted.

There is a "health check timeout" which I like to think of as the "startup
timeout".  During initial startup, the health check process will wait this
long (polling every couple seconds) for the app to become healthy.  This value
is configurable (60-600 seconds in
[Pivotal Cloud Foundry](https://pivotal.io/platform)),
supporting apps which have more intensive setup tasks.

There is also an "invocation timeout" which controls how long the health
checker will wait for a response from a running app (after initial startup
has completed and app provided first healthy response).  Historically, this
was hard coded to one second.  This meant apps that needed to do intensive
health checks would often timeout and be judged unhealthy (restart!).

[A patch was provided which makes this configurable](https://github.com/cloudfoundry/cloud_controller_ng/issues/1055)
, but when I first heard about this I had flashbacks to a prior life...
The general problem is nothing CF specific. I recall working around similar
issues when Nagios and Cacti were cutting edge (poller timeouts).  This is not
a pattern I invented, colleagues much smarter than I pointed out the solution
was decoupling the response from test execution rather than fewer (reduced
coverage) or less accurate tests (port vs HTTP checks).

Even with configurable timeouts, decoupling is good. I tried to keep this
pattern as simple as possible so it can be easily studied.  In the real world
you would likely be importing middleware, split out tests, etc.
The idea is using async/await to properly run and gather results for any number
of long-lived tests while keeping your endpoint as responsive and accurate as
possible.

As stated above...  I'm not a developer.  I really enjoy playing with Node,
primarily because of the small learning curve (and consistency
of Javascript across the full MERN stack), but if you are a real
developer I'm sure you can think of ways to improve this pattern.  Hopefully
this is a useful reference for folks who haven't thought about it before, and
if you are someone who spends most of your time thinking about challenges
like this... please share ideas for improvement.

Have fun!

# References

- https://docs.cloudfoundry.org/concepts/architecture
- https://docs.pivotal.io/pivotalcf/2-4/devguide/deploy-apps/healthchecks.html
- https://stackabuse.com/using-global-variables-in-node-js
- https://dev.to/geoff/writing-asyncawait-middleware-in-express-6i0
- https://medium.com/@tkssharma/writing-neat-asynchronous-node-js-code-with-promises-async-await-fa8d8b0bcd7c
- https://httpie.org/
