# seamless
Seamless interaction with iframes

## Steps to setup Seamless in the Top Window AND Iframe Pages


* Download "Seamless" javascript package from https://github.com/rsmoorthy/seamless/releases/download/v1.0/seamless_v1.0.min.js and install in your server
* Include Seamless in your page header, along with jQuery, BootStrap and Bootbox

```
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css" type="text/css">
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap-theme.min.css" type="text/css">
<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/bootbox.js/4.4.0/bootbox.min.js"></script>


<script src="/js/seamless_v1.0.min.js" type="text/javascript"></script>
(OR)
<script src="https://s3.ap-south-1.amazonaws.com/rsm-seamless/seamless.min.js" type="text/javascript"></script>
```

## Steps to setup Seamless in the Top Window Page

* Include the following script in your html page, at the bottom

```
<script type="text/javascript">
  $(function() {
    var seamless = new Seamless({acceptFrom:'https://iframe.host.name'});
  });
</script>
```


* Include the iframe pointing to child form, as below.

```
<iframe id="iframe" src="https://www.host.name/"
  scrolling="no" style="overflow: hidden; border: none; height: 80%; width: 100%"/>
```

## Steps to setup Seamless within the iframe

* Include the following script in your html page, at the bottom

```
<script type="text/javascript">
  $(function() {
    var seamless = new Seamless({acceptFrom:'https://top.host.name', child: true, selector: 'body'});
  });
</script>
```

## Additional Options

* `acceptFrom` can be partial host name like `www.host.name` or `host.name` or any regular expression

* `acceptFrom` can also be an array of host names (complete, partial or regular expression) as follows:

```
<script type="text/javascript">
  $(function() {
    var seamless = new Seamless({acceptFrom:['www.host.name', 'host2.name']});
  });
</script>
```

* `onStart` - A callback function when the seamless module is being started.

* `onInit` - A callback function when the seamless initializations have been complete, and seamless has successfully exchanged init
messages from the parent/child.
