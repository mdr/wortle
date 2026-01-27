import * as pulumi from "@pulumi/pulumi";
export declare class OrgApiKey extends pulumi.CustomResource {
    /**
     * Get an existing OrgApiKey resource's state with the given name, ID, and optional extra
     * properties used to qualify the lookup.
     *
     * @param name The _unique_ name of the resulting resource.
     * @param id The _unique_ provider ID of the resource to lookup.
     * @param state Any extra arguments used during the lookup.
     * @param opts Optional settings to control the behavior of the CustomResource.
     */
    static get(name: string, id: pulumi.Input<pulumi.ID>, state?: OrgApiKeyState, opts?: pulumi.CustomResourceOptions): OrgApiKey;
    /**
     * Returns true if the given object is an instance of OrgApiKey.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    static isInstance(obj: any): obj is OrgApiKey;
    /**
     * The generated 64-bit token required to access the Neon API.
     */
    readonly key: pulumi.Output<string>;
    /**
     * The name of the API Key.
     */
    readonly name: pulumi.Output<string>;
    /**
     * The organisation ID.
     */
    readonly orgId: pulumi.Output<string>;
    /**
     * The project ID to which this key will grant the access to.
     */
    readonly projectId: pulumi.Output<string | undefined>;
    /**
     * Create a OrgApiKey resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args: OrgApiKeyArgs, opts?: pulumi.CustomResourceOptions);
}
/**
 * Input properties used for looking up and filtering OrgApiKey resources.
 */
export interface OrgApiKeyState {
    /**
     * The generated 64-bit token required to access the Neon API.
     */
    key?: pulumi.Input<string>;
    /**
     * The name of the API Key.
     */
    name?: pulumi.Input<string>;
    /**
     * The organisation ID.
     */
    orgId?: pulumi.Input<string>;
    /**
     * The project ID to which this key will grant the access to.
     */
    projectId?: pulumi.Input<string>;
}
/**
 * The set of arguments for constructing a OrgApiKey resource.
 */
export interface OrgApiKeyArgs {
    /**
     * The name of the API Key.
     */
    name?: pulumi.Input<string>;
    /**
     * The organisation ID.
     */
    orgId: pulumi.Input<string>;
    /**
     * The project ID to which this key will grant the access to.
     */
    projectId?: pulumi.Input<string>;
}
