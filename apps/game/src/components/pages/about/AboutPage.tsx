import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Card } from "@/components/shadcn/Card"
import { assetUrl } from "@/utils/utils"

export const AboutPage = () => (
  <main className="bg-background min-h-screen">
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link to="/" className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm">
        <ArrowLeft className="mr-1 size-4" />
        Back to quiz
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <img src={assetUrl("/logo.png")} alt="" className="size-20" />
        <h1 className="text-3xl font-bold">About Wortle</h1>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">What is Wortle?</h2>
          <p className="text-muted-foreground">
            Wortle is a daily wild plant identification quiz for plants in Britain and Ireland. Each day, you're
            presented with photographs of a plant growing in the wild and challenged to identify it by its common or
            scientific name. If you're familiar with Wordle - this is similar, but for plant ID! Everyone gets the same
            puzzle every day.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">How to play</h2>
          <ol className="text-muted-foreground list-inside list-decimal space-y-2">
            <li>Study the photographs carefully - you can zoom and pan to see details</li>
            <li>Use the observation details (location, habitat, date) as clues</li>
            <li>Search for the plant by common name or scientific name</li>
            <li>Submit your answer to see if you're correct</li>
            <li>Come back tomorrow for a new challenge!</li>
          </ol>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Tips for identification</h2>
          <ul className="text-muted-foreground list-inside list-disc space-y-2">
            <li>Pay attention to flower shape, colour, and arrangement</li>
            <li>Look at leaf shape, margins, and how they attach to the stem</li>
            <li>Consider the habitat - woodland, grassland, wetland, etc.</li>
            <li>The time of year can help narrow down flowering species</li>
            <li>Use the location to consider regional variations</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">How can I learn to identify plants?</h2>
          <p className="text-muted-foreground mb-3">
            If you're new to plant identification, consider getting a good field guide.{" "}
            <a
              href="https://www.summerfieldbooks.com/product/british-and-irish-wild-flowers-and-plants-a-pocket-guide/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline"
            >
              British and Irish Wild Flowers and Plants: A Pocket Guide
            </a>{" "}
            is an excellent starting point.
          </p>
          <p className="text-muted-foreground">
            You should also check out the{" "}
            <a
              href="https://bsbi.org/learn/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline"
            >
              Botanical Society of Britain &amp; Ireland
            </a>
            , who have great resources for getting started with botany.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">About the project</h2>
          <p className="text-muted-foreground mb-3">
            Wortle was created to help people improve their ID skills and appreciate the wild plants of the UK and
            Ireland. All photographs are sourced from real observations and are credited to their photographers.
          </p>
          <p className="text-muted-foreground">
            This is a free community project, owned by everyone. The{" "}
            <a
              href="https://github.com/mdr/wortle"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline"
            >
              code is open source
            </a>{" "}
            and all images are licensed under Creative Commons licences.
          </p>
        </Card>
      </div>
    </div>
  </main>
)
