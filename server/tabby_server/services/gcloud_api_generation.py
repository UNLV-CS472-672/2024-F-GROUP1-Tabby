from __main__ import app    # noqa
from http import HTTPStatus # noqa

# General API Credentiual creation info.
#   https://developers.google.com/books/docs/v1/using#APIKey
#   https://cloud.google.com/docs/authentication#auth-decision-tree
#   https://cloud.google.com/docs/authentication/api-keys?visit_id=638640428078497359-1875880913&rd=1#before_you_begin
#   https://cloud.google.com/docs/authentication/api-keys?visit_id=638640428078497359-1875880913&rd=1#create
#   https://developers.google.com/books/docs/v1/using#APIKey

# Service keys are needed for live use.
#   https://cloud.google.com/docs/authentication/provide-credentials-adc#local-key
#   https://cloud.google.com/docs/authentication#service-accounts
#   https://cloud.google.com/iam/docs/keys-create-delete#creating
# User Accounts are recommended for production environments.
#   https://cloud.google.com/docs/authentication/provide-credentials-adc#local-user-cred

# Steps to install gcloudCLI.
#   https://cloud.google.com/sdk/docs/install

# Pretty sure we need to install google cloud package (Not implemented yet).
#   https://cloud.google.com/python/docs/reference/apikeys/latest
# If we do make api keys, best to limit it immediately for best practice.
# Not entirely necessary for production code or local environments.
#   https://cloud.google.com/docs/authentication/api-keys?visit_id=638640428078497359-1875880913&rd=1#api_key_restrictions
#   https://cloud.google.com/docs/authentication/api-keys?visit_id=638640428078497359-1875880913&rd=1#adding-api-restrictions

'''
This will generate an api key to be used when a search query is made.
It will also have the means to delete it.
'''
