# Chat HTML IDs
* sentMessages: For message displaying. InnerHTML shoud look like:
<!-- example message-->
<div class="ms-Grid-row">
    <p style="margin-left: 20px; margin-right: 20px; margin-top:10px; padding:8px; background-color: #efefef; text-align: left;">
        <i class="ms-Icon ms-Icon--DelveAnalyticsLogo" aria-hidden="true""></i>
        This is a very new message
    </p>
</div>
<!--End of example message-->
* submission: For input text holding. Should extract its 'value' attribute.
<input id="submission" type="text" placeholder="Type your message" style="width: 100%; height: 100%; border: none;">
* submit: For submit button
* endChat: For end chat button