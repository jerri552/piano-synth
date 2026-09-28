provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "piano_server" {
  ami           = "ami-0e1bed4f06a3b463d" # Standard Ubuntu Linux image
  instance_type = "t2.micro"              # Free-tier eligible server

  tags = {
    Name = "PianoSynthServer"
  }
}