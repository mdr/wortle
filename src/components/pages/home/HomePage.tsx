import { Link } from "@tanstack/react-router"
import { useState } from "react"

import { useClock, usePuzzles, useSchedule } from "@/components/app/GlobalDependenciesProvider"
import { Button } from "@/components/shadcn/Button"
import { Card } from "@/components/shadcn/Card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/Select"
import { HeaderNav } from "@/components/shared/HeaderNav"
import { Iso8601Date } from "@/utils/brandedTypes"
import { formatDate } from "@/utils/dateUtils"
import { assetUrl } from "@/utils/utils"

import { HomeTestIds } from "./HomeTestIds"

export const HomePage = () => {
  const puzzles = usePuzzles()
  const puzzleIds = puzzles.getAllPuzzleIds()
  const clock = useClock()
  const schedule = useSchedule()
  const scheduledDates = schedule.getAllScheduledDates()
  const [currentDate, setCurrentDate] = useState(clock.todayIso())

  const handleDateChange = (value: string) => {
    const newDate = Iso8601Date(value)
    clock.setDate?.(newDate)
    setCurrentDate(newDate)
  }

  return (
    <main className="bg-background min-h-screen" data-testid={HomeTestIds.page}>
      {/* Header */}
      <header className="border-border bg-card min-w-[334px] border-b">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-shrink-0 items-center gap-3">
              <img src={assetUrl("/logo.png")} alt="" className="size-12 min-[520px]:size-20" />
              <div>
                <h1 className="text-foreground font-serif text-xl font-bold min-[520px]:text-2xl">Wortle</h1>
                <p className="text-muted-foreground hidden text-sm min-[520px]:block">Daily Wild Plant Quiz</p>
              </div>
            </div>
            <HeaderNav />
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-foreground font-serif text-2xl font-bold">Daily puzzle</h2>
            <p className="text-muted-foreground">
              Jump into today's puzzle. Your result counts toward your daily stats.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to="/daily" data-testid={HomeTestIds.dailyPuzzleLink}>
                <Button size="lg">Play today's puzzle</Button>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Date:</span>
                <Select value={currentDate} onValueChange={handleDateChange}>
                  <SelectTrigger className="w-auto" aria-label="Select date">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduledDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {formatDate(date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-foreground font-serif text-2xl font-bold">Welcome to the Wortle prototype!</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                This is a project to create a daily plant ID quiz - a bit like the "Wordle" but for botany! The idea is
                to be a fun community-driven thing to get people interested in wild plants and help them practice their
                plant ID skills.
              </p>
              <p>
                This site is currently just a proof of concept to demonstrate the idea - click the links below to see
                examples of how it might work. I'd love to hear your thoughts on the prototype - does it make sense what
                to do, and could any aspects be improved? And ultimately, is it fun and might it interest people?
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-foreground font-serif text-2xl font-bold">Try the prototype</h2>
            <p className="text-muted-foreground">Select a puzzle below to see how it might work:</p>

            <div className="flex flex-col gap-3">
              {puzzleIds.map((id) => (
                <Link
                  key={id}
                  to="/review/$puzzleId"
                  params={{ puzzleId: String(id) }}
                  data-testid={HomeTestIds.puzzleLink}
                >
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    Puzzle #{id}
                  </Button>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-foreground font-serif text-2xl font-bold">How you can help</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                I'm a software developer by trade and emphatically not a botanist, in fact very much a beginner! One of
                the key ways I'll need help is in making sure the botanical details are correct. Most obviously, to
                verify that the plants are indeed what they are claimed to be, but also that the photographs give
                sufficient detail to unambiguously identify the species, and to help give correct and useful ID tips to
                players.
              </p>
              <p>
                I'll also need help to collect enough sets of photos to be able to keep up with the pace of showing a
                new puzzle each day.
              </p>
              <p>
                If you'd be interested in helping out this project, either to help with reviewing the botany, or
                contributing puzzle photos, or helping with the technical aspects - please get in touch. I'm Matt
                Russell, and you can reach me at{" "}
                <a href="mailto:matt@wortle.app" className="hover:text-foreground underline">
                  matt@wortle.app
                </a>
                .
              </p>
              <p>
                As mentioned above, the intention is for this to be a community project - certainly no interest in
                commercialising or putting in adverts etc. The code and photographs will be open source.
              </p>
              <p>
                The aim is to launch this in Spring 2026, to give time to collect enough puzzles and get the site ready.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
