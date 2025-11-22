interface roomListItemDataType {
	profile?: {
		memberID: any
		isAdmin: boolean
		joinedOn: NativeDate
		unread: number
		muted: boolean
		pinned: boolean
	}
	groupID: string, name?: string, image?: string, groupType: "dialogue" | "group", friend?: { name: string, _id: string }, friends?: { name: string, _id: string }[]
	recent: {
		message: any
		date: NativeDate
	}
	blocked: {
		status: boolean
		by: any
	}
	members: string[]
	message: IMessageInstanceX
}