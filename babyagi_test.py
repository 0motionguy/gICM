import babyagi

# Register a simple function
@babyagi.register_function()
def world():
    return "world"

# Register a function that depends on 'world'
@babyagi.register_function(dependencies=["world"])
def hello_world():
    x = world()
    return f"Hello {x}!"

# Execute the function
print(babyagi.hello_world())  # Output: Hello world!

if __name__ == "__main__":
    app = babyagi.create_app('/dashboard')
    app.run(host='0.0.0.0', port=8080)
