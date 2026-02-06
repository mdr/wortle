import { BucketName, ObjectKey } from "./brandedTypes"

export const SPECIES_DATA_BUCKET = BucketName("wortle-data")
export const SPECIES_DATA_KEY = ObjectKey("species.json")
export const PUZZLES_DATA_KEY = ObjectKey("puzzles.json")

export const ORIGINALS_BUCKET = BucketName("wortle-originals")
export const IMAGES_BUCKET = BucketName("wortle-images")
export const STAGING_PREFIX = "staging/"
