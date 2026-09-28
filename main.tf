terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {}

# Tell Terraform to use the image you built in Step 2
resource "docker_image" "piano_image" {
  name         = "piano-synth-app:latest"
  keep_locally = true
}

# Instruct Terraform to create a live container
resource "docker_container" "piano_server" {
  name  = "terraform-piano-live"
  image = docker_image.piano_image.name

  ports {
    internal = 80
    external = 8081
  }
}