"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Degrees,
  filterSpeciesByQuery,
  getLicenseDisplayName,
  ImageKey,
  ImageMediaType,
  imageMediaTypeExtension,
  Iso8601Date,
  License,
  ObjectKey,
  PuzzleId,
  SpeciesId,
} from "@wortle/shared"
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DatePicker,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wortle/ui"
import { Check, ChevronsUpDown, Loader2, Upload, Trash2 } from "lucide-react"
import dynamic from "next/dynamic"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { type ApiPuzzle, type CreatePuzzleRequest, type EditPuzzleRequest } from "@/api/puzzleTypes"
import { trpc } from "@/trpc/client"
import { toPreviewBlob } from "@/utils/heicPreview"
import { filenameToImageKey, uploadImage } from "@/utils/uploadImage"

import { SortableItem } from "./SortableItem"

const LocationPicker = dynamic(() => import("./LocationPicker").then((mod) => mod.LocationPicker), { ssr: false })

const formSchema = z.object({
  id: z.number().int().positive("ID must be a positive integer"),
  speciesId: z.string().min(1, "Species is required"),
  observationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
  location: z.object({
    description: z.string().min(1, "Location description is required"),
    latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
    longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  }),
  habitat: z.string().min(1, "Habitat is required"),
  photoAttribution: z.object({
    photographer: z.string().min(1, "Photographer is required"),
    license: z.enum(License, { message: "Please select a license" }),
  }),
  images: z
    .array(
      z.object({
        imageKey: z.string().min(1, "Image key is required"),
        caption: z.string(),
        mediaType: z.enum(ImageMediaType),
        stagingKey: z.string().optional(),
      }),
    )
    .min(1, "At least one image is required"),
})

export type PuzzleFormData = z.infer<typeof formSchema>

const formDataToCreatePuzzleRequest = (data: PuzzleFormData): CreatePuzzleRequest => ({
  id: PuzzleId(data.id),
  speciesId: SpeciesId(data.speciesId),
  observationDate: Iso8601Date(data.observationDate),
  location: {
    description: data.location.description,
    coordinates: {
      latitude: Degrees(data.location.latitude),
      longitude: Degrees(data.location.longitude),
    },
  },
  habitat: data.habitat,
  photoAttribution: {
    photographer: data.photoAttribution.photographer,
    license: data.photoAttribution.license,
  },
  images: data.images.map((img) => ({
    imageKey: ImageKey(img.imageKey),
    caption: img.caption,
    mediaType: img.mediaType,
    stagingKey: img.stagingKey ? ObjectKey(img.stagingKey) : undefined,
  })),
})

const formDataToEditPuzzleRequest: (data: PuzzleFormData) => EditPuzzleRequest = formDataToCreatePuzzleRequest

export const apiPuzzleToFormData = (puzzle: ApiPuzzle): PuzzleFormData => ({
  id: puzzle.id,
  speciesId: puzzle.speciesId,
  observationDate: puzzle.observationDate,
  location: {
    description: puzzle.location.description,
    latitude: puzzle.location.coordinates.latitude,
    longitude: puzzle.location.coordinates.longitude,
  },
  habitat: puzzle.habitat,
  photoAttribution: {
    photographer: puzzle.photoAttribution.photographer,
    license: puzzle.photoAttribution.license,
  },
  images: puzzle.images.map((img) => ({
    imageKey: img.imageKey,
    caption: img.caption,
    mediaType: img.mediaType,
  })),
})

const emptyFormData: PuzzleFormData = {
  id: 0,
  speciesId: "",
  observationDate: "",
  location: {
    description: "",
    latitude: 0,
    longitude: 0,
  },
  habitat: "",
  photoAttribution: {
    photographer: "",
    license: License.CC_BY_SA_4,
  },
  images: [],
}

export enum FormMode {
  NEW = "NEW",
  EDIT = "EDIT",
}

type PuzzleFormProps = {
  mode: FormMode
  initialValues?: PuzzleFormData
  onSubmit: (data: CreatePuzzleRequest) => void
  onCancel: () => void
  isPending: boolean
  error?: { message: string } | null
  onDelete?: () => void
  isDeleting?: boolean
}

type SpeciesComboboxProps = {
  value: SpeciesId | ""
  onChange: (value: SpeciesId) => void
  id?: string
}

const SpeciesCombobox = ({ value, onChange, id }: SpeciesComboboxProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { data: speciesList, isLoading, error, refetch } = trpc.species.list.useQuery()

  const filteredSpecies = speciesList ? filterSpeciesByQuery(speciesList, search) : []

  const selectedSpecies = speciesList?.find((s) => s.id === value)

  const getButtonText = () => {
    if (error) return "Failed to load species"
    if (isLoading) return "Loading species..."
    if (selectedSpecies) return `${selectedSpecies.commonName} (${selectedSpecies.scientificName})`
    return "Select a species..."
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between font-normal ${error ? "border-destructive text-destructive" : ""}`}
          disabled={isLoading}
        >
          {getButtonText()}
          <ChevronsUpDown className="text-muted-foreground h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search species..." value={search} onValueChange={setSearch} />
          <CommandList>
            {error ? (
              <div className="p-4 text-center">
                <p className="text-destructive text-sm">Failed to load species</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => void refetch()}>
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <CommandEmpty>No species found.</CommandEmpty>
                <CommandGroup>
                  {filteredSpecies.map((species) => (
                    <CommandItem
                      key={species.id}
                      value={species.id}
                      onSelect={() => {
                        onChange(species.id)
                        setOpen(false)
                        setSearch("")
                      }}
                    >
                      <Check className={`mr-2 h-4 w-4 ${value === species.id ? "opacity-100" : "opacity-0"}`} />
                      <span>
                        {species.commonName} <span className="text-muted-foreground">({species.scientificName})</span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export const PuzzleForm = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isPending,
  error,
  onDelete,
  isDeleting,
}: PuzzleFormProps) => {
  const formId = useId()
  const form = useForm<PuzzleFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? emptyFormData,
  })

  const isEditMode = mode === FormMode.EDIT
  const images = useFieldArray({ control: form.control, name: "images" })
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(0)
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map())
  const previewUrlsRef = useRef(previewUrls)
  previewUrlsRef.current = previewUrls

  useEffect(() => () => previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)), [])

  const puzzleId = form.watch("id")

  const getPreviewUrl = (image: {
    imageKey: string
    mediaType: ImageMediaType
    stagingKey?: string
  }): string | undefined => {
    if (image.stagingKey) return previewUrls.get(image.stagingKey)
    if (isEditMode && image.imageKey)
      return `/api/originals/${puzzleId}/${image.imageKey}${imageMediaTypeExtension(image.mediaType)}`
    return undefined
  }

  const handleFiles = useCallback(
    async (files: File[]) => {
      setUploadError(null)
      for (const file of files) {
        try {
          setUploading((n) => n + 1)
          const previewBlob = await toPreviewBlob(file)
          const blobUrl = URL.createObjectURL(previewBlob)
          const { stagingKey, mediaType } = await uploadImage(file)
          setPreviewUrls((prev) => new Map(prev).set(stagingKey, blobUrl))
          images.append({
            imageKey: filenameToImageKey(file.name),
            caption: "",
            mediaType,
            stagingKey,
          })
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : "Upload failed")
        } finally {
          setUploading((n) => n - 1)
        }
      }
    },
    [images],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => void handleFiles(files),
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/heic": [".heic"] },
    noClick: false,
    noKeyboard: true,
  })

  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      const imageFiles = Array.from(event.clipboardData.files).filter(
        (f) => f.type === "image/jpeg" || f.type === "image/heic",
      )
      if (imageFiles.length > 0) {
        event.preventDefault()
        void handleFiles(imageFiles)
      }
    },
    [handleFiles],
  )

  const prevIsPendingRef = useRef(isPending)

  useEffect(() => {
    if (prevIsPendingRef.current && !isPending && !error) {
      form.reset(form.getValues())
    }
    prevIsPendingRef.current = isPending
  }, [isPending, error, form])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd =
    (fields: { id: string }[], move: (from: number, to: number) => void) => (event: DragEndEvent) => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        const oldIndex = fields.findIndex((f) => f.id === active.id)
        const newIndex = fields.findIndex((f) => f.id === over.id)
        move(oldIndex, newIndex)
      }
    }

  const toRequest = mode === FormMode.NEW ? formDataToCreatePuzzleRequest : formDataToEditPuzzleRequest
  const handleFormSubmit = (data: PuzzleFormData) => onSubmit(toRequest(data))

  return (
    <form onSubmit={(e) => void form.handleSubmit(handleFormSubmit)(e)} className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor={`${formId}-id`}>ID</Label>
        <Input
          id={`${formId}-id`}
          type="number"
          {...form.register("id", { valueAsNumber: true })}
          className={isEditMode ? "bg-muted" : ""}
          disabled={isEditMode}
        />
        {form.formState.errors.id && <p className="text-destructive text-sm">{form.formState.errors.id.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor={`${formId}-speciesId`}>Species</Label>
        <Controller
          control={form.control}
          name="speciesId"
          render={({ field }) => (
            <SpeciesCombobox
              id={`${formId}-speciesId`}
              value={field.value as SpeciesId | ""}
              onChange={field.onChange}
            />
          )}
        />
        {form.formState.errors.speciesId && (
          <p className="text-destructive text-sm">{form.formState.errors.speciesId.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor={`${formId}-observationDate`}>Observation Date</Label>
        <Controller
          control={form.control}
          name="observationDate"
          render={({ field }) => (
            <DatePicker
              id={`${formId}-observationDate`}
              value={field.value ? new Date(field.value + "T00:00:00") : undefined}
              onChange={(date) => field.onChange(date?.toISOString().split("T")[0] ?? "")}
              placeholder="Select observation date"
            />
          )}
        />
        {form.formState.errors.observationDate && (
          <p className="text-destructive text-sm">{form.formState.errors.observationDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <div className="space-y-3 rounded-md border p-3">
          <div className="space-y-1">
            <Label htmlFor={`${formId}-location-description`}>Description</Label>
            <Input id={`${formId}-location-description`} {...form.register("location.description")} />
            {form.formState.errors.location?.description && (
              <p className="text-destructive text-sm">{form.formState.errors.location.description.message}</p>
            )}
          </div>
          <LocationPicker
            latitude={form.watch("location.latitude")}
            longitude={form.watch("location.longitude")}
            onChange={(coords) => {
              form.setValue("location.latitude", coords.latitude, { shouldDirty: true })
              form.setValue("location.longitude", coords.longitude, { shouldDirty: true })
            }}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor={`${formId}-location-latitude`}>Latitude</Label>
              <Input
                id={`${formId}-location-latitude`}
                type="number"
                step="any"
                {...form.register("location.latitude", { valueAsNumber: true })}
              />
              {form.formState.errors.location?.latitude && (
                <p className="text-destructive text-sm">{form.formState.errors.location.latitude.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${formId}-location-longitude`}>Longitude</Label>
              <Input
                id={`${formId}-location-longitude`}
                type="number"
                step="any"
                {...form.register("location.longitude", { valueAsNumber: true })}
              />
              {form.formState.errors.location?.longitude && (
                <p className="text-destructive text-sm">{form.formState.errors.location.longitude.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor={`${formId}-habitat`}>Habitat</Label>
        <Input id={`${formId}-habitat`} {...form.register("habitat")} />
        {form.formState.errors.habitat && (
          <p className="text-destructive text-sm">{form.formState.errors.habitat.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Photo Attribution</Label>
        <div className="space-y-3 rounded-md border p-3">
          <div className="space-y-1">
            <Label htmlFor={`${formId}-photographer`}>Photographer</Label>
            <Input id={`${formId}-photographer`} {...form.register("photoAttribution.photographer")} />
            {form.formState.errors.photoAttribution?.photographer && (
              <p className="text-destructive text-sm">{form.formState.errors.photoAttribution.photographer.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${formId}-license`}>License</Label>
            <Controller
              control={form.control}
              name="photoAttribution.license"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={`${formId}-license`}>
                    <SelectValue placeholder="Select a license..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(License).map((license) => (
                      <SelectItem key={license} value={license}>
                        {getLicenseDisplayName(license)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.photoAttribution?.license && (
              <p className="text-destructive text-sm">{form.formState.errors.photoAttribution.license.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <div className="space-y-2 rounded-md border p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd(images.fields, images.move)}
          >
            <SortableContext items={images.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {images.fields.map((field, index) => {
                const imageKeyError = form.formState.errors.images?.[index]?.imageKey
                const captionError = form.formState.errors.images?.[index]?.caption
                const previewUrl = getPreviewUrl(field)
                return (
                  <SortableItem key={field.id} id={field.id} showHandle={images.fields.length > 1}>
                    <div className="flex items-center gap-2">
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt={field.caption || field.imageKey}
                          className="h-16 w-16 shrink-0 rounded-md object-cover"
                        />
                      )}
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Input
                            {...form.register(`images.${index}.imageKey`)}
                            placeholder="Image key"
                            className="flex-1"
                            aria-invalid={!!imageKeyError}
                          />
                          <Input
                            {...form.register(`images.${index}.caption`)}
                            placeholder="Caption (optional)"
                            className="flex-1"
                            aria-invalid={!!captionError}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => images.remove(index)}
                            aria-label="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {(imageKeyError || captionError) && (
                          <p className="text-destructive text-sm">{imageKeyError?.message || captionError?.message}</p>
                        )}
                      </div>
                    </div>
                  </SortableItem>
                )
              })}
            </SortableContext>
          </DndContext>
          {form.formState.errors.images?.root && (
            <p className="text-destructive text-sm">{form.formState.errors.images.root.message}</p>
          )}
          {form.formState.errors.images?.message && (
            <p className="text-destructive text-sm">{form.formState.errors.images.message}</p>
          )}
          {uploadError && <p className="text-destructive text-sm">{uploadError}</p>}
          {uploading > 0 ? (
            <div className="border-muted-foreground/25 flex flex-col items-center gap-1 rounded-md border-2 border-dashed p-4 text-center text-sm">
              <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">
                Uploading {uploading === 1 ? "image" : `${uploading} images`}…
              </span>
            </div>
          ) : (
            <div
              {...getRootProps()}
              onPaste={handlePaste}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-md border-2 border-dashed p-4 text-center text-sm transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"}`}
            >
              <input {...getInputProps()} />
              <Upload className="text-muted-foreground h-5 w-5" />
              <span className="text-muted-foreground">
                {isDragActive ? "Drop images here" : "Drop, click, or paste images (JPEG/HEIC)"}
              </span>
            </div>
          )}
        </div>
      </div>

      {error && <div className="text-destructive text-sm">{error.message}</div>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={!form.formState.isDirty || isPending}>
          {isPending ? (isEditMode ? "Saving..." : "Creating...") : isEditMode ? "Save" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {isEditMode && onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete} disabled={isDeleting} className="ml-auto">
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        )}
      </div>
    </form>
  )
}
