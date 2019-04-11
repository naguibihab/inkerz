fun=$1
serverless deploy function -s dev -f $fun && 
serverless logs -f $fun -t