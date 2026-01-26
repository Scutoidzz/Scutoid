# Running LLMs on An Intel Celeron

Now me, being the person I am, decided to try doing things that don't make sense.

I started by downloading ollama, and using my favorite model as a former Google Glazer - Gemma3:270m.
Using this model, I was able to get about 1.2 t/s, but it was dumb. Really dumb.

| User | Gemma3:270m |
| :--- | :--- |
| Hi | Hello! How are you? |
| Just testing the AI | I hope testing the AI is going well, what can I do for you? |
| What can you do? | What can I do for you? |

So yeah, really dumb.

#### Eventually I got tired of this and it was using all my storage so I got rid of it.

## Act 2: SmolLM

I tried using SmolLM 135M. This time it was HORRIBLE. It kept telling me some story about a campfire. Let me make this clear:

> **I am NOT in love with SmolLM.**

I then moved onto SmolLM 360M. It was slower than I expected, but it didn't have the same amount of repetition that Gemma3:270M had.

I was satisfied, but I needed a thinking model.

## Act 3: DeepSeek

I started out using DeepSeek distilled 1.5B. It was actually pretty good, I was getting speeds around 0.7 t/s. I needed something faster though, and it wouldn't work with anything that would connect to the ollama API so I got rid of it. I switched to llama.cpp around this point.

## Final Act: Qwen

I ended this using Qwen 0.6B. I was surprised how well it worked. I loved using it and it had actual good reasoning speeds. It was a bit slow, and it took about 60 seconds to reason when asking for a joke, but it has an original joke I have never heard an LLM say:

### What do you call a man who is so kind he will take the whole lunch?
#### A Silly man!

## Conclusion

If you are a hopeless dope like me who wants to run LLMs on a Celeron and 4GB of RAM, I recommend:

### SmolLM 360M for non-reasoning
and
### Qwen 0.6B for reasoning

## My Specs:
+ Intel Celeron N4020
+ 4GB DDR4 RAM
